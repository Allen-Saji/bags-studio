import { NextRequest, NextResponse } from 'next/server';
import { BAGS_API_BASE } from '@/lib/constants';
import { auth } from '@/lib/auth';

// Rate limit: simple in-memory counter per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 100; // requests per window
const RATE_WINDOW = 60_000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  entry.count++;
  return entry.count <= RATE_LIMIT;
}

function getClientIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const ip = getClientIP(request);
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  const { path } = await params;
  const apiPath = path.join('/');
  const searchParams = request.nextUrl.searchParams.toString();
  const url = `${BAGS_API_BASE}/${apiPath}${searchParams ? `?${searchParams}` : ''}`;

  const apiKey = process.env.BAGS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 30 },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('Bags API proxy error:', err);
    return NextResponse.json({ error: 'Failed to fetch from Bags API' }, { status: 502 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  // POST requests require authentication — prevents open relay abuse
  const session = await auth();
  if (!session?.user?.provider) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const ip = getClientIP(request);
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  const { path } = await params;
  const apiPath = path.join('/');
  const url = `${BAGS_API_BASE}/${apiPath}`;

  const apiKey = process.env.BAGS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('Bags API proxy error:', err);
    return NextResponse.json({ error: 'Failed to fetch from Bags API' }, { status: 502 });
  }
}
