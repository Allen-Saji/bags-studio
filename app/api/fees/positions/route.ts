import { NextRequest, NextResponse } from 'next/server';
import { getClaimablePositions } from '@/lib/bags-wrapper';
import { requireAuth } from '@/lib/auth-session';

export async function GET(request: NextRequest) {
  // Require authentication for viewing positions
  const authResult = await requireAuth();
  if (authResult instanceof Response) return authResult;

  const wallet = request.nextUrl.searchParams.get('wallet') || authResult.wallet;

  if (!wallet) {
    return NextResponse.json({ error: 'Missing required param: wallet' }, { status: 400 });
  }

  try {
    const positions = await getClaimablePositions(wallet);
    return NextResponse.json({ positions });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to get claimable positions';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
