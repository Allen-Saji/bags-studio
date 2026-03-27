import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth-session';
import { PublicKey, Transaction, Connection } from '@solana/web3.js';
import {
  getVaultStatePDA,
  getTreasuryPDA,
  buildUpdateDistributionIx,
} from '@/lib/reward-program';
import { buildMerkleTree, proofToHex } from '@/lib/merkle-tree';
import { getSolBalance } from '@/lib/solana-rpc';

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

  // Require authentication to trigger distribution
  const authResult = await requireAuth(mint);
  if (authResult instanceof Response) return authResult;

  let body: { caller: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.caller) {
    return NextResponse.json({ error: 'caller wallet is required' }, { status: 400 });
  }

  const supabase = getServiceSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  try {
    const tokenMint = new PublicKey(mint);
    const callerKey = new PublicKey(body.caller);
    const [vaultStatePDA] = getVaultStatePDA(tokenMint);
    const [treasuryPDA] = getTreasuryPDA(tokenMint);

    // Get treasury balance
    const treasuryBalance = await getSolBalance(treasuryPDA.toBase58());
    if (treasuryBalance <= 0) {
      return NextResponse.json(
        { error: 'Treasury has no SOL. Fees need to accumulate first.' },
        { status: 400 },
      );
    }

    // Get engagement leaderboard
    const { data: leaderboard, error: lbError } = await supabase
      .from('engagement_leaderboard')
      .select('wallet, total_points')
      .eq('mint_address', mint)
      .gt('total_points', 0)
      .order('total_points', { ascending: false });

    if (lbError || !leaderboard || leaderboard.length === 0) {
      return NextResponse.json(
        { error: 'No eligible wallets on leaderboard' },
        { status: 400 },
      );
    }

    const totalPoints = leaderboard.reduce(
      (sum, e) => sum + Number(e.total_points),
      0,
    );

    // Platform fee: 2% of treasury balance
    const PLATFORM_FEE_BPS = 200; // 2%
    const platformFee = Math.floor(treasuryBalance * PLATFORM_FEE_BPS / 10000);
    const distributableBalance = treasuryBalance - platformFee;

    // Compute pro-rata allocations from distributable balance (after platform fee)
    const entries = leaderboard.map((e) => ({
      wallet: e.wallet,
      amount: BigInt(
        Math.floor((Number(e.total_points) / totalPoints) * distributableBalance),
      ),
      points: Number(e.total_points),
    }));

    // Filter out zero allocations
    const nonZeroEntries = entries.filter((e) => e.amount > 0n);
    if (nonZeroEntries.length === 0) {
      return NextResponse.json(
        { error: 'All allocations rounded to zero' },
        { status: 400 },
      );
    }

    const totalAllocation = nonZeroEntries.reduce(
      (sum, e) => sum + e.amount,
      0n,
    );

    // Build merkle tree
    const tree = buildMerkleTree(
      nonZeroEntries.map((e) => ({ wallet: e.wallet, amount: e.amount })),
    );

    // Get last epoch number
    const { data: lastEpoch } = await supabase
      .from('reward_epochs')
      .select('epoch_number')
      .eq('mint_address', mint)
      .order('epoch_number', { ascending: false })
      .limit(1)
      .single();

    const epochNumber = (lastEpoch?.epoch_number || 0) + 1;
    const now = new Date();
    const epochEndsAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Create epoch record
    const { data: epoch, error: epochError } = await supabase
      .from('reward_epochs')
      .insert({
        mint_address: mint,
        epoch_number: epochNumber,
        vault_balance: treasuryBalance,
        eligible_wallets: nonZeroEntries.length,
        merkle_root: tree.root.toString('hex'),
        epoch_ends_at: epochEndsAt.toISOString(),
        total_allocation_lamports: Number(totalAllocation),
      })
      .select()
      .single();

    if (epochError || !epoch) {
      console.error('Failed to create epoch:', epochError);
      return NextResponse.json({ error: 'Failed to create epoch' }, { status: 500 });
    }

    // Create claim records with merkle proofs
    const claims = nonZeroEntries.map((e) => ({
      epoch_id: epoch.id,
      mint_address: mint,
      wallet: e.wallet,
      points_at_snapshot: e.points,
      reward_lamports: Number(e.amount),
      merkle_proof: proofToHex(tree.proofs.get(e.wallet) || []),
      on_chain_epoch: epochNumber,
    }));

    for (let i = 0; i < claims.length; i += 500) {
      await supabase.from('reward_claims').insert(claims.slice(i, i + 500));
    }

    // Build update_distribution instruction
    const ix = buildUpdateDistributionIx(
      vaultStatePDA,
      tokenMint,
      callerKey,
      tree.root,
      totalAllocation,
    );

    const connection = new Connection(getRpcUrl());
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash();

    const tx = new Transaction();
    tx.add(ix);
    tx.recentBlockhash = blockhash;
    tx.lastValidBlockHeight = lastValidBlockHeight;
    tx.feePayer = callerKey;

    const serialized = tx
      .serialize({ requireAllSignatures: false })
      .toString('base64');

    return NextResponse.json({
      transaction: serialized,
      epoch: epochNumber,
      merkleRoot: tree.root.toString('hex'),
      totalAllocation: Number(totalAllocation),
      eligibleWallets: nonZeroEntries.length,
      treasuryBalance,
      platformFee,
      platformFeeBps: PLATFORM_FEE_BPS,
    });
  } catch (err) {
    console.error('Distribute error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Distribution failed' },
      { status: 500 },
    );
  }
}
