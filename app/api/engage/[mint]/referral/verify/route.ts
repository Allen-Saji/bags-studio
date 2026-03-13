import { NextRequest, NextResponse } from 'next/server';
import { verifyReferral } from '@/lib/referral';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ mint: string }> }
) {
  const { mint } = await params;

  let body: { referred_wallet: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.referred_wallet) {
    return NextResponse.json({ error: 'referred_wallet is required' }, { status: 400 });
  }

  try {
    const verified = await verifyReferral(mint, body.referred_wallet);
    return NextResponse.json({ verified });
  } catch (err) {
    console.error('Referral verify error:', err);
    return NextResponse.json({ error: 'Failed to verify referral' }, { status: 500 });
  }
}
