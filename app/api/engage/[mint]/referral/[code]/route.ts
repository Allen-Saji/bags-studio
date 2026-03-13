import { NextRequest, NextResponse } from 'next/server';
import { getReferralCode } from '@/lib/referral';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ mint: string; code: string }> }
) {
  const { mint, code } = await params;

  try {
    const referral = await getReferralCode(code);
    if (!referral) {
      return NextResponse.json({ error: 'Referral code not found' }, { status: 404 });
    }
    return NextResponse.json(referral);
  } catch (err) {
    console.error('Referral lookup error:', err);
    return NextResponse.json({ error: 'Failed to look up referral code' }, { status: 500 });
  }
}
