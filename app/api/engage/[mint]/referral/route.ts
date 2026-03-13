import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateReferralCode, getReferralStats } from '@/lib/referral';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ mint: string }> }
) {
  const { mint } = await params;

  let body: { wallet: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.wallet) {
    return NextResponse.json({ error: 'wallet is required' }, { status: 400 });
  }

  try {
    const code = await getOrCreateReferralCode(mint, body.wallet);
    const stats = await getReferralStats(mint, body.wallet);
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
