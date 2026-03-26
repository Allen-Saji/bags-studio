import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-session';
import { getTreasuryPDA } from '@/lib/reward-program';
import { PublicKey } from '@solana/web3.js';
import { BAGS_API_BASE } from '@/lib/constants';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ mint: string }> },
) {
  const { mint } = await params;

  const authResult = await requireRole(mint, 'admin');
  if (authResult instanceof Response) return authResult;

  const apiKey = process.env.BAGS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Bags API key not configured' },
      { status: 500 },
    );
  }

  try {
    const tokenMint = new PublicKey(mint);
    const [treasuryPDA] = getTreasuryPDA(tokenMint);
    const treasuryAddress = treasuryPDA.toBase58();

    // Check claim stats — if Treasury PDA appears as a claimer, fee-share is configured
    const url = `${BAGS_API_BASE}/token-launch/claim-stats?tokenMint=${encodeURIComponent(mint)}`;
    const res = await fetch(url, {
      headers: { 'x-api-key': apiKey },
    });

    if (!res.ok) {
      return NextResponse.json(
        { verified: false, treasuryPDA: treasuryAddress, error: 'Failed to fetch claim stats' },
        { status: 200 },
      );
    }

    const json = await res.json();
    if (!json.success) {
      return NextResponse.json(
        { verified: false, treasuryPDA: treasuryAddress, error: 'Bags API error' },
        { status: 200 },
      );
    }

    const claimers: Array<{ wallet: string }> = json.response || [];
    const verified = claimers.some(
      (c) => c.wallet === treasuryAddress,
    );

    return NextResponse.json({
      verified,
      treasuryPDA: treasuryAddress,
      message: verified
        ? 'Fee-share verified! Treasury PDA is configured as a fee recipient.'
        : 'Treasury PDA not found in fee-share config. Add it on bags.fm first.',
    });
  } catch (err) {
    console.error('Verify fee-share error:', err);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 },
    );
  }
}
