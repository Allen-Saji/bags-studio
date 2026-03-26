import { NextRequest, NextResponse } from 'next/server';
import { setupVault } from '@/lib/rewards';
import { requireRole } from '@/lib/auth-session';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ mint: string }> }
) {
  const { mint } = await params;

  // Require creator or admin role — vault setup is privileged
  const authResult = await requireRole(mint, 'admin');
  if (authResult instanceof Response) return authResult;

  let body: {
    vault_wallet: string;
    fee_share_bps: number;
    funding_source: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.vault_wallet || body.fee_share_bps == null || !body.funding_source) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const vault = await setupVault(mint, body.vault_wallet, body.fee_share_bps, body.funding_source);
    return NextResponse.json(vault, { status: 201 });
  } catch (err) {
    console.error('Setup vault error:', err);
    return NextResponse.json({ error: 'Failed to setup vault' }, { status: 500 });
  }
}
