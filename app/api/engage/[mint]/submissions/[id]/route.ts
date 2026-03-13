import { NextRequest, NextResponse } from 'next/server';
import { reviewSubmission } from '@/lib/quests';
import { verifyTokenOwner } from '@/lib/verify-ownership';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ mint: string; id: string }> }
) {
  const { mint, id } = await params;

  let body: { approved: boolean; creator_wallet: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (typeof body.approved !== 'boolean' || !body.creator_wallet) {
    return NextResponse.json({ error: 'approved and creator_wallet are required' }, { status: 400 });
  }

  try {
    const isOwner = await verifyTokenOwner(mint, body.creator_wallet);
    if (!isOwner) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    await reviewSubmission(id, body.approved);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Review submission error:', err);
    return NextResponse.json({ error: 'Failed to review submission' }, { status: 500 });
  }
}
