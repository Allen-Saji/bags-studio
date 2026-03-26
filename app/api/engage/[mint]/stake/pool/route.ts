import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-session';
import { getServiceSupabase } from '@/lib/supabase';
import { PublicKey, Transaction, Connection } from '@solana/web3.js';
import { getVaultStatePDA, getStakePoolPDA, getStakeVaultPDA, buildInitializeStakePoolIx } from '@/lib/reward-program';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

function getRpcUrl(): string {
  const key = process.env.HELIUS_API_KEY;
  return key ? `https://mainnet.helius-rpc.com/?api-key=${key}` : 'https://api.mainnet-beta.solana.com';
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ mint: string }> },
) {
  const { mint } = await params;
  try {
    const tokenMint = new PublicKey(mint);
    const [stakePoolPDA] = getStakePoolPDA(tokenMint);
    const connection = new Connection(getRpcUrl());
    const info = await connection.getAccountInfo(stakePoolPDA);
    if (!info) return NextResponse.json({ pool: null });

    // Also get cached positions count from DB
    const supabase = getServiceSupabase();
    let stakerCount = 0;
    if (supabase) {
      const { count } = await supabase
        .from('stake_positions')
        .select('*', { count: 'exact', head: true })
        .eq('mint_address', mint)
        .gt('amount', 0);
      stakerCount = count || 0;
    }

    return NextResponse.json({ pool: { address: stakePoolPDA.toBase58(), exists: true }, stakerCount });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch stake pool' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ mint: string }> },
) {
  const { mint } = await params;
  const authResult = await requireRole(mint, 'admin');
  if (authResult instanceof Response) return authResult;
  if (!authResult.wallet) return NextResponse.json({ error: 'No wallet linked' }, { status: 400 });

  let body: { min_stake: number; points_rate: number };
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  try {
    const tokenMint = new PublicKey(mint);
    const admin = new PublicKey(authResult.wallet);
    const [vaultStatePDA] = getVaultStatePDA(tokenMint);

    const ix = buildInitializeStakePoolIx(
      vaultStatePDA, tokenMint, admin, TOKEN_PROGRAM_ID,
      BigInt(body.min_stake), BigInt(body.points_rate),
    );

    const connection = new Connection(getRpcUrl());
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    const tx = new Transaction();
    tx.add(ix);
    tx.recentBlockhash = blockhash;
    tx.lastValidBlockHeight = lastValidBlockHeight;
    tx.feePayer = admin;

    return NextResponse.json({
      transaction: tx.serialize({ requireAllSignatures: false }).toString('base64'),
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 });
  }
}
