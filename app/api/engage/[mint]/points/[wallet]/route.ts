import { NextRequest, NextResponse } from 'next/server';
import { getWalletPoints } from '@/lib/points';
import { getStreak } from '@/lib/streaks';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ mint: string; wallet: string }> }
) {
  const { mint, wallet } = await params;

  try {
    const [points, streak] = await Promise.all([
      getWalletPoints(mint, wallet),
      getStreak(mint, wallet),
    ]);
    return NextResponse.json({ points: points ?? null, streak: streak ?? null });
  } catch (err) {
    console.error('Wallet points error:', err);
    return NextResponse.json({ error: 'Failed to fetch wallet points' }, { status: 500 });
  }
}
