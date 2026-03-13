import { getServiceSupabase, getSupabase } from './supabase';
import { WalletScore } from './types';

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

interface CachedRow {
  wallet: string;
  score: number;
  tier: string;
  claim_count: number;
  total_claimed: number;
  balance_score: number;
  claim_score: number;
  consistency_score: number;
  balance: number;
  distinct_days: number;
  computed_at: string;
}

function rowToWalletScore(row: CachedRow): WalletScore {
  return {
    wallet: row.wallet,
    score: Number(row.score),
    tier: row.tier as WalletScore['tier'],
    balanceScore: Number(row.balance_score),
    claimScore: Number(row.claim_score),
    consistencyScore: Number(row.consistency_score),
    balance: Number(row.balance),
    claimCount: row.claim_count,
    totalClaimed: Number(row.total_claimed),
    distinctDays: row.distinct_days,
  };
}

/**
 * Try to read cached scores. Returns null if cache is stale or missing.
 */
export async function getCachedScores(mint: string): Promise<WalletScore[] | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  // Check freshness by looking at the most recent computed_at for this mint
  const { data: sample } = await supabase
    .from('supporter_scores')
    .select('computed_at')
    .eq('mint_address', mint)
    .order('computed_at', { ascending: false })
    .limit(1);

  if (!sample || sample.length === 0) return null;

  const computedAt = new Date(sample[0].computed_at).getTime();
  if (Date.now() - computedAt > CACHE_TTL_MS) return null;

  // Fetch all cached scores for this mint
  const { data, error } = await supabase
    .from('supporter_scores')
    .select('*')
    .eq('mint_address', mint)
    .order('score', { ascending: false });

  if (error || !data || data.length === 0) return null;

  return (data as CachedRow[]).map(rowToWalletScore);
}

/**
 * Write scores to cache using service key (bypasses RLS).
 */
export async function cacheScores(mint: string, scores: WalletScore[]): Promise<void> {
  const supabase = getServiceSupabase();
  if (!supabase || scores.length === 0) return;

  const now = new Date().toISOString();

  const rows = scores.map(s => ({
    mint_address: mint,
    wallet: s.wallet,
    score: s.score,
    tier: s.tier,
    claim_count: s.claimCount,
    total_claimed: s.totalClaimed,
    balance_score: s.balanceScore,
    claim_score: s.claimScore,
    consistency_score: s.consistencyScore,
    balance: s.balance,
    distinct_days: s.distinctDays,
    computed_at: now,
  }));

  // Upsert in batches of 500
  for (let i = 0; i < rows.length; i += 500) {
    const batch = rows.slice(i, i + 500);
    await supabase
      .from('supporter_scores')
      .upsert(batch, { onConflict: 'mint_address,wallet' });
  }
}
