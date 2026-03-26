import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { PublicKey } from '@solana/web3.js';
import { getVaultStatePDA, getTreasuryPDA } from '@/lib/reward-program';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ mint: string; wallet: string }> },
) {
  const { mint, wallet } = await params;

  const supabase = getServiceSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  try {
    // Get the latest unclaimed reward for this wallet
    const { data: claim, error } = await supabase
      .from('reward_claims')
      .select('*, reward_epochs!inner(epoch_number, merkle_root, epoch_ends_at)')
      .eq('mint_address', mint)
      .eq('wallet', wallet)
      .eq('claimed', false)
      .not('merkle_proof', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !claim) {
      return NextResponse.json(
        { error: 'No unclaimed rewards with proofs found' },
        { status: 404 },
      );
    }

    const tokenMint = new PublicKey(mint);
    const [vaultStatePDA] = getVaultStatePDA(tokenMint);
    const [treasuryPDA] = getTreasuryPDA(tokenMint);

    return NextResponse.json({
      claimId: claim.id,
      amount: claim.reward_lamports,
      proof: claim.merkle_proof,
      epoch: claim.on_chain_epoch || claim.reward_epochs.epoch_number,
      vaultState: vaultStatePDA.toBase58(),
      treasury: treasuryPDA.toBase58(),
      epochEndsAt: claim.reward_epochs.epoch_ends_at,
    });
  } catch (err) {
    console.error('Proof fetch error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch proof' },
      { status: 500 },
    );
  }
}
