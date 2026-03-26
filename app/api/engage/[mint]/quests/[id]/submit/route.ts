import { NextRequest, NextResponse } from 'next/server';
import { submitQuestProof } from '@/lib/quests';
import { getWalletFromAuthOrBody } from '@/lib/auth-session';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ mint: string; id: string }> }
) {
  const { mint, id } = await params;

  const authResult = await getWalletFromAuthOrBody(request, mint);
  if (authResult instanceof Response) return authResult;
  const { wallet } = authResult;

  let body: { proof_url: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.proof_url) {
    return NextResponse.json({ error: 'proof_url is required' }, { status: 400 });
  }

  try {
    const submission = await submitQuestProof(id, wallet, body.proof_url);
    return NextResponse.json(submission, { status: 201 });
  } catch (err) {
    console.error('Quest submit error:', err);
    return NextResponse.json({ error: 'Failed to submit quest proof' }, { status: 500 });
  }
}
