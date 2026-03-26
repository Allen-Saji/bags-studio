import { NextRequest, NextResponse } from 'next/server';
import { PublicKey, Transaction, Connection } from '@solana/web3.js';
import { getStakePoolPDA, buildOpenStakePositionIx } from '@/lib/reward-program';
import { getWalletFromAuthOrBody } from '@/lib/auth-session';

function getRpcUrl(): string {
  const key = process.env.HELIUS_API_KEY;
  return key ? `https://mainnet.helius-rpc.com/?api-key=${key}` : 'https://api.mainnet-beta.solana.com';
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ mint: string }> },
) {
  const { mint } = await params;
  const authResult = await getWalletFromAuthOrBody(request, mint);
  if (authResult instanceof Response) return authResult;

  try {
    const tokenMint = new PublicKey(mint);
    const owner = new PublicKey(authResult.wallet);
    const [stakePoolPDA] = getStakePoolPDA(tokenMint);

    const ix = buildOpenStakePositionIx(stakePoolPDA, owner);
    const connection = new Connection(getRpcUrl());
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    const tx = new Transaction();
    tx.add(ix);
    tx.recentBlockhash = blockhash;
    tx.lastValidBlockHeight = lastValidBlockHeight;
    tx.feePayer = owner;

    return NextResponse.json({
      transaction: tx.serialize({ requireAllSignatures: false }).toString('base64'),
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 });
  }
}
