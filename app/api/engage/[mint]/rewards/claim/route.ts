import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { PublicKey, Transaction, Connection } from '@solana/web3.js';
import {
  getVaultStatePDA,
  getTreasuryPDA,
  buildClaimIx,
} from '@/lib/reward-program';
import { proofFromHex } from '@/lib/merkle-tree';
import { requireAuth } from '@/lib/auth-session';

function getRpcUrl(): string {
  const key = process.env.HELIUS_API_KEY;
  return key
    ? `https://mainnet.helius-rpc.com/?api-key=${key}`
    : 'https://api.mainnet-beta.solana.com';
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ mint: string }> },
) {
  const { mint } = await params;

  // Require authentication
  const authResult = await requireAuth(mint);
  if (authResult instanceof Response) return authResult;

  let body: { claim_id: string; wallet: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.claim_id || !body.wallet) {
    return NextResponse.json(
      { error: 'claim_id and wallet are required' },
      { status: 400 },
    );
  }

  const supabase = getServiceSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  try {
    // Fetch the claim record
    const { data: claim, error: claimError } = await supabase
      .from('reward_claims')
      .select('*, reward_epochs!inner(epoch_number)')
      .eq('id', body.claim_id)
      .eq('wallet', body.wallet)
      .eq('claimed', false)
      .single();

    if (claimError || !claim) {
      return NextResponse.json(
        { error: 'Claim not found or already claimed' },
        { status: 404 },
      );
    }

    if (!claim.merkle_proof) {
      return NextResponse.json(
        { error: 'No merkle proof available — legacy claim' },
        { status: 400 },
      );
    }

    const tokenMint = new PublicKey(mint);
    const claimant = new PublicKey(body.wallet);
    const [vaultStatePDA] = getVaultStatePDA(tokenMint);
    const [treasuryPDA] = getTreasuryPDA(tokenMint);
    const epoch = claim.on_chain_epoch || claim.reward_epochs.epoch_number;

    // Build claim instruction
    const proof = proofFromHex(claim.merkle_proof);
    const ix = buildClaimIx(
      vaultStatePDA,
      tokenMint,
      treasuryPDA,
      claimant,
      epoch,
      BigInt(claim.reward_lamports),
      proof,
    );

    // Build transaction
    const connection = new Connection(getRpcUrl());
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash();

    const tx = new Transaction();
    tx.add(ix);
    tx.recentBlockhash = blockhash;
    tx.lastValidBlockHeight = lastValidBlockHeight;
    tx.feePayer = claimant;

    const serialized = tx
      .serialize({ requireAllSignatures: false })
      .toString('base64');

    return NextResponse.json({
      transaction: serialized,
      claimId: claim.id,
      amount: claim.reward_lamports,
    });
  } catch (err) {
    console.error('Claim error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Claim failed' },
      { status: 500 },
    );
  }
}

/**
 * PATCH — Mark a claim as completed after on-chain confirmation.
 * Called by the client after successfully sending the signed transaction.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ mint: string }> },
) {
  const { mint } = await params;

  const authResult = await requireAuth(mint);
  if (authResult instanceof Response) return authResult;

  let body: { claim_id: string; signature: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.claim_id || !body.signature) {
    return NextResponse.json(
      { error: 'claim_id and signature required' },
      { status: 400 },
    );
  }

  const supabase = getServiceSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const { error } = await supabase
    .from('reward_claims')
    .update({
      claimed: true,
      signature: body.signature,
      claimed_at: new Date().toISOString(),
    })
    .eq('id', body.claim_id);

  if (error) {
    return NextResponse.json({ error: 'Failed to update claim' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
