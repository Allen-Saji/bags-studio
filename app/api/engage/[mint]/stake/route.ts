import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { PublicKey, Transaction, Connection } from '@solana/web3.js';
import { getStakePoolPDA, getUserStakePDA, buildStakeIx, buildUnstakeIx } from '@/lib/reward-program';
import { getWalletFromAuthOrBody } from '@/lib/auth-session';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

function getRpcUrl(): string {
  const key = process.env.HELIUS_API_KEY;
  return key ? `https://mainnet.helius-rpc.com/?api-key=${key}` : 'https://api.mainnet-beta.solana.com';
}

// POST — stake tokens
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ mint: string }> },
) {
  const { mint } = await params;
  const authResult = await getWalletFromAuthOrBody(request, mint);
  if (authResult instanceof Response) return authResult;

  let body: { amount: number; user_token_account: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  if (!body.amount || !body.user_token_account) {
    return NextResponse.json({ error: 'amount and user_token_account required' }, { status: 400 });
  }

  try {
    const tokenMint = new PublicKey(mint);
    const owner = new PublicKey(authResult.wallet);
    const [stakePoolPDA] = getStakePoolPDA(tokenMint);
    const userTokenAccount = new PublicKey(body.user_token_account);

    const ix = buildStakeIx(stakePoolPDA, tokenMint, owner, userTokenAccount, TOKEN_PROGRAM_ID, BigInt(body.amount));
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

// DELETE — unstake tokens
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ mint: string }> },
) {
  const { mint } = await params;
  const authResult = await getWalletFromAuthOrBody(request, mint);
  if (authResult instanceof Response) return authResult;

  let body: { amount: number; user_token_account: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  if (!body.amount || !body.user_token_account) {
    return NextResponse.json({ error: 'amount and user_token_account required' }, { status: 400 });
  }

  try {
    const tokenMint = new PublicKey(mint);
    const owner = new PublicKey(authResult.wallet);
    const [stakePoolPDA] = getStakePoolPDA(tokenMint);
    const userTokenAccount = new PublicKey(body.user_token_account);

    const ix = buildUnstakeIx(stakePoolPDA, tokenMint, owner, userTokenAccount, TOKEN_PROGRAM_ID, BigInt(body.amount));
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
