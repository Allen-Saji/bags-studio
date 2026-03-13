import { NextRequest, NextResponse } from 'next/server';
import { getLeaderboard } from '@/lib/points';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ mint: string }> }
) {
  const { mint } = await params;
  const url = request.nextUrl;
  const limit = parseInt(url.searchParams.get('limit') || '50', 10);
  const offset = parseInt(url.searchParams.get('offset') || '0', 10);

  try {
    const { entries, total } = await getLeaderboard(mint, limit, offset);
    return NextResponse.json({ entries, total });
  } catch (err) {
    console.error('Leaderboard error:', err);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
