import { NextRequest, NextResponse } from 'next/server';
import { getPosts, createPost } from '@/lib/community';
import { getSplTokenBalance } from '@/lib/solana-rpc';
import { awardPoints } from '@/lib/points';
import { MAX_POST_LENGTH, POINTS_COMMUNITY_POST } from '@/lib/constants';
import { getWalletFromAuthOrBody } from '@/lib/auth-session';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ mint: string }> }
) {
  const { mint } = await params;
  const limit = parseInt(request.nextUrl.searchParams.get('limit') || '30');
  const offset = parseInt(request.nextUrl.searchParams.get('offset') || '0');

  const posts = await getPosts(mint, limit, offset);
  return NextResponse.json({ posts });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ mint: string }> }
) {
  const { mint } = await params;

  // Authenticate: session wallet or fallback to wallet-adapter
  const authResult = await getWalletFromAuthOrBody(request, mint);
  if (authResult instanceof Response) return authResult;
  const { wallet } = authResult;

  let body: { content: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.content?.trim()) {
    return NextResponse.json({ error: 'content is required' }, { status: 400 });
  }

  if (body.content.length > MAX_POST_LENGTH) {
    return NextResponse.json({ error: `Content must be ${MAX_POST_LENGTH} characters or less` }, { status: 400 });
  }

  // Check token holder
  const balance = await getSplTokenBalance(wallet, mint);
  if (balance <= 0) {
    return NextResponse.json({ error: 'You must hold this token to post' }, { status: 403 });
  }

  const post = await createPost(mint, wallet, body.content.trim());
  if (!post) {
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }

  // Award points for posting (non-blocking)
  awardPoints(mint, wallet, POINTS_COMMUNITY_POST, 'quest', post.id).catch(() => {});

  return NextResponse.json(post, { status: 201 });
}
