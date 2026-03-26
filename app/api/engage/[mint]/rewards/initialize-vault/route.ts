import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-session';
import { getServiceSupabase } from '@/lib/supabase';
import { PublicKey, Transaction, Connection } from '@solana/web3.js';
import {
  buildInitializeVaultIx,
  getVaultStatePDA,
  getTreasuryPDA,
} from '@/lib/reward-program';

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

  // Require creator/admin role
  const authResult = await requireRole(mint, 'admin');
  if (authResult instanceof Response) return authResult;

  if (!authResult.wallet) {
    return NextResponse.json(
      { error: 'No wallet linked. Connect a wallet to create a vault.' },
      { status: 400 },
    );
  }

  try {
    const tokenMint = new PublicKey(mint);
    const admin = new PublicKey(authResult.wallet);

    const [vaultStatePDA] = getVaultStatePDA(tokenMint);
    const [treasuryPDA] = getTreasuryPDA(tokenMint);

    // Build the initialize_vault instruction
    const ix = buildInitializeVaultIx(admin, tokenMint);

    // Build transaction
    const connection = new Connection(getRpcUrl());
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash();

    const tx = new Transaction();
    tx.add(ix);
    tx.recentBlockhash = blockhash;
    tx.lastValidBlockHeight = lastValidBlockHeight;
    tx.feePayer = admin;

    // Return unsigned transaction for client to sign
    const serialized = tx
      .serialize({ requireAllSignatures: false })
      .toString('base64');

    // Store vault info in DB
    const supabase = getServiceSupabase();
    if (supabase) {
      await supabase.from('reward_vaults').upsert(
        {
          mint_address: mint,
          vault_wallet: treasuryPDA.toBase58(),
          vault_state_pda: vaultStatePDA.toBase58(),
          treasury_pda: treasuryPDA.toBase58(),
          on_chain: true,
          fee_share_bps: 0,
          funding_source: 'direct',
        },
        { onConflict: 'mint_address' },
      );
    }

    return NextResponse.json({
      transaction: serialized,
      vaultStatePDA: vaultStatePDA.toBase58(),
      treasuryPDA: treasuryPDA.toBase58(),
    });
  } catch (err) {
    console.error('Initialize vault error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to create vault' },
      { status: 500 },
    );
  }
}
