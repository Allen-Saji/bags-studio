import { NextRequest, NextResponse } from 'next/server';
import { BAGS_API_BASE } from '@/lib/constants';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
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
