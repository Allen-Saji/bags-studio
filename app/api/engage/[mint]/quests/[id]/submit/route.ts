import { NextRequest, NextResponse } from 'next/server';
import { submitQuestProof } from '@/lib/quests';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ mint: string; id: string }> }
) {
  const { mint, id } = await params;

  let body: { wallet: string; proof_url: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.wallet || !body.proof_url) {
    return NextResponse.json({ error: 'wallet and proof_url are required' }, { status: 400 });
  }

  try {
    const submission = await submitQuestProof(id, body.wallet, body.proof_url);
    return NextResponse.json(submission, { status: 201 });
  } catch (err) {
    console.error('Quest submit error:', err);
    return NextResponse.json({ error: 'Failed to submit quest proof' }, { status: 500 });
  }
}
