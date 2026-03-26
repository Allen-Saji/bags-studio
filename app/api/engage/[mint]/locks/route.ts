import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { requireRole } from '@/lib/auth-session';
import { PublicKey, Transaction, Connection } from '@solana/web3.js';
import { buildCreateLockIx } from '@/lib/reward-program';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

function getRpcUrl(): string {
  const key = process.env.HELIUS_API_KEY;
  return key ? `https://mainnet.helius-rpc.com/?api-key=${key}` : 'https://api.mainnet-beta.solana.com';
}

// GET — list all locks for this token
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ mint: string }> },
) {
  const { mint } = await params;
  const supabase = getServiceSupabase();
  if (!supabase) return NextResponse.json({ locks: [] });

  const { data } = await supabase
    .from('token_locks')
    .select('*')
    .eq('mint_address', mint)
    .order('lock_start', { ascending: false });

  return NextResponse.json({ locks: data || [] });
}

// POST — create a new lock (creator only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ mint: string }> },
) {
  const { mint } = await params;
  const authResult = await requireRole(mint, 'admin');
  if (authResult instanceof Response) return authResult;
  if (!authResult.wallet) return NextResponse.json({ error: 'No wallet linked' }, { status: 400 });

  let body: { amount: number; lock_duration_secs: number; lock_index: number; creator_token_account: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  try {
    const tokenMint = new PublicKey(mint);
    const creator = new PublicKey(authResult.wallet);
    const creatorTokenAccount = new PublicKey(body.creator_token_account);

    const ix = buildCreateLockIx(
      tokenMint, creator, creatorTokenAccount, TOKEN_PROGRAM_ID,
      BigInt(body.amount), BigInt(body.lock_duration_secs), body.lock_index,
    );

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
