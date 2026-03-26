import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-session';
import { PublicKey, Transaction, Connection } from '@solana/web3.js';
import { buildReleaseLockIx } from '@/lib/reward-program';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

function getRpcUrl(): string {
  const key = process.env.HELIUS_API_KEY;
  return key ? `https://mainnet.helius-rpc.com/?api-key=${key}` : 'https://api.mainnet-beta.solana.com';
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ mint: string }> },
) {
  const { mint } = await params;
  const authResult = await requireRole(mint, 'admin');
  if (authResult instanceof Response) return authResult;
  if (!authResult.wallet) return NextResponse.json({ error: 'No wallet linked' }, { status: 400 });

  let body: { lock_index: number; creator_token_account: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  try {
    const tokenMint = new PublicKey(mint);
    const creator = new PublicKey(authResult.wallet);
    const creatorTokenAccount = new PublicKey(body.creator_token_account);

    const ix = buildReleaseLockIx(tokenMint, creator, creatorTokenAccount, TOKEN_PROGRAM_ID, body.lock_index);
    const connection = new Connection(getRpcUrl());
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    const tx = new Transaction();
    tx.add(ix);
    tx.recentBlockhash = blockhash;
    tx.lastValidBlockHeight = lastValidBlockHeight;
    tx.feePayer = creator;

    return NextResponse.json({
      transaction: tx.serialize({ requireAllSignatures: false }).toString('base64'),
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 });
  }
}
