import { NextRequest, NextResponse } from 'next/server';
import { refreshFullLeaderboard } from '@/lib/points';
import { requireRole } from '@/lib/auth-session';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ mint: string }> }
) {
  const { mint } = await params;

  // Only admin/creator can trigger expensive leaderboard refresh
  const authResult = await requireRole(mint, 'admin');
  if (authResult instanceof Response) return authResult;

  try {
    await refreshFullLeaderboard(mint);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Refresh leaderboard error:', err);
    return NextResponse.json({ error: 'Failed to refresh leaderboard' }, { status: 500 });
  }
}
