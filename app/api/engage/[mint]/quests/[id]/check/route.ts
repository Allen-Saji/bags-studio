import { NextRequest, NextResponse } from 'next/server';
import { checkQuestCompletion } from '@/lib/quests';
import { getWalletFromAuthOrBody } from '@/lib/auth-session';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ mint: string; id: string }> }
) {
  const { mint, id } = await params;

  const authResult = await getWalletFromAuthOrBody(request, mint);
  if (authResult instanceof Response) return authResult;
  const { wallet } = authResult;

  try {
    const result = await checkQuestCompletion(id, wallet);
    return NextResponse.json(result);
  } catch (err) {
    console.error('Quest check error:', err);
    return NextResponse.json({ error: 'Failed to check quest' }, { status: 500 });
  }
}
