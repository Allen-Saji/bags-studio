import { NextRequest, NextResponse } from 'next/server';
import { addReaction, removeReaction } from '@/lib/community';
import { ALLOWED_REACTIONS } from '@/lib/constants';
import { getWalletFromAuthOrBody } from '@/lib/auth-session';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ mint: string; postId: string }> }
) {
  const { mint, postId } = await params;

  const authResult = await getWalletFromAuthOrBody(request, mint);
  if (authResult instanceof Response) return authResult;
  const { wallet } = authResult;

  let body: { emoji: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.emoji) {
    return NextResponse.json({ error: 'emoji is required' }, { status: 400 });
  }

  if (!ALLOWED_REACTIONS.includes(body.emoji as typeof ALLOWED_REACTIONS[number])) {
    return NextResponse.json({ error: 'Invalid reaction emoji' }, { status: 400 });
  }

  const ok = await addReaction(postId, wallet, body.emoji);
  return NextResponse.json({ ok });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ mint: string; postId: string }> }
) {
  const { mint, postId } = await params;

  const authResult = await getWalletFromAuthOrBody(request, mint);
  if (authResult instanceof Response) return authResult;
  const { wallet } = authResult;

  let body: { emoji: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const ok = await removeReaction(postId, wallet, body.emoji);
  return NextResponse.json({ ok });
}
