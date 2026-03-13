import { NextRequest, NextResponse } from 'next/server';
import { getWalletRewards } from '@/lib/rewards';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ mint: string; wallet: string }> }
) {
  const { mint, wallet } = await params;

  try {
    const claims = await getWalletRewards(mint, wallet);
    const totalClaimable = claims
      .filter((c: { claimed_at: string | null }) => !c.claimed_at)
      .reduce((sum: number, c: { reward_lamports: number }) => sum + c.reward_lamports, 0);
    return NextResponse.json({ claims, totalClaimable });
  } catch (err) {
    console.error('Wallet rewards error:', err);
    return NextResponse.json({ error: 'Failed to fetch wallet rewards' }, { status: 500 });
  }
}
