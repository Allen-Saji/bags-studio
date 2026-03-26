import { NextRequest, NextResponse } from 'next/server';
import { getReferralCode, createReferral } from '@/lib/referral';
import { getWalletFromAuthOrBody } from '@/lib/auth-session';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ mint: string }> }
) {
  const { mint } = await params;

  const authResult = await getWalletFromAuthOrBody(request, mint);
  if (authResult instanceof Response) return authResult;
  const { wallet } = authResult;

  let body: { referral_code: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.referral_code) {
    return NextResponse.json({ error: 'referral_code is required' }, { status: 400 });
  }

  try {
    const codeData = await getReferralCode(body.referral_code);
    if (!codeData) {
      return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 });
    }

    const referral = await createReferral(
      mint,
      codeData.wallet,
      wallet,
      body.referral_code,
    );

    return NextResponse.json({ recorded: !!referral });
  } catch (err) {
    console.error('Referral record error:', err);
    return NextResponse.json({ error: 'Failed to record referral' }, { status: 500 });
  }
}
