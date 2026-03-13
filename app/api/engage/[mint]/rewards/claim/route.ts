import { NextRequest, NextResponse } from 'next/server';
import { markRewardClaimed } from '@/lib/rewards';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ mint: string }> }
) {
  const { mint } = await params;

  let body: { claim_id: string; signature: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.claim_id || !body.signature) {
    return NextResponse.json({ error: 'claim_id and signature are required' }, { status: 400 });
  }

  try {
    await markRewardClaimed(body.claim_id, body.signature);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Claim reward error:', err);
    return NextResponse.json({ error: 'Failed to mark reward as claimed' }, { status: 500 });
  }
}
