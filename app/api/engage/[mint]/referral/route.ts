import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateReferralCode, getReferralStats } from '@/lib/referral';
import { getWalletFromAuthOrBody } from '@/lib/auth-session';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ mint: string }> }
) {
  const { mint } = await params;

  const authResult = await getWalletFromAuthOrBody(request, mint);
  if (authResult instanceof Response) return authResult;
  const { wallet } = authResult;

  try {
    const code = await getOrCreateReferralCode(mint, wallet);
    const stats = await getReferralStats(mint, wallet);
    return NextResponse.json({
      code,
      link: `https://bags.studio/r/${code}`,
      stats,
    });
  } catch (err) {
    console.error('Referral code error:', err);
    return NextResponse.json({ error: 'Failed to generate referral code' }, { status: 500 });
  }
}
