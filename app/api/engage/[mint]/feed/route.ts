import { NextRequest, NextResponse } from 'next/server';
import { getFeed } from '@/lib/feed';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ mint: string }> }
) {
  const { mint } = await params;
  const url = request.nextUrl;
  const limit = parseInt(url.searchParams.get('limit') || '30', 10);
  const offset = parseInt(url.searchParams.get('offset') || '0', 10);

  try {
    const events = await getFeed(mint, limit, offset);
    return NextResponse.json({ events });
  } catch (err) {
    console.error('Feed error:', err);
    return NextResponse.json({ error: 'Failed to fetch feed' }, { status: 500 });
  }
}
