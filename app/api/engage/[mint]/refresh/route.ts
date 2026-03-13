import { NextRequest, NextResponse } from 'next/server';
import { refreshFullLeaderboard } from '@/lib/points';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ mint: string }> }
) {
  const { mint } = await params;

  try {
    await refreshFullLeaderboard(mint);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Refresh leaderboard error:', err);
    return NextResponse.json({ error: 'Failed to refresh leaderboard' }, { status: 500 });
  }
}
