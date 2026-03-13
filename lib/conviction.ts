import { ClaimEvent, WalletScore, ConvictionTier, TokenHolder } from './types';
import { TIER_PERCENTILES, TIER_ORDER } from './constants';

interface WalletStats {
  wallet: string;
  balance: number; // human-readable (after decimals)
  claimCount: number;
  totalClaimed: number; // in lamports
  distinctDays: number;
}

function dayKey(ts: string): string {
  return new Date(ts).toISOString().slice(0, 10);
}

/**
 * Compute conviction scores from on-chain holders + optional claim events.
 *
 * Scoring breakdown (100 pts total):
 * - Balance score (50pts): token balance relative to top holder
 * - Claim score (30pts): total fee-share claimed relative to top claimer
 * - Consistency score (20pts): distinct claim days relative to most consistent claimer
 *
 * If no claim events exist, balance is weighted 100%.
 */
export function computeConvictionScores(
  holders: TokenHolder[],
  claimEvents: ClaimEvent[],
  decimals: number = 9,
): WalletScore[] {
  if (holders.length === 0) return [];

  // Build claim stats by wallet
  const claimMap = new Map<string, { totalClaimed: number; claimCount: number; distinctDays: Set<string> }>();
  for (const e of claimEvents) {
    let stats = claimMap.get(e.wallet);
    if (!stats) {
      stats = { totalClaimed: 0, claimCount: 0, distinctDays: new Set() };
      claimMap.set(e.wallet, stats);
    }
    stats.totalClaimed += typeof e.amount === 'string' ? parseFloat(e.amount) || 0 : e.amount;
    stats.claimCount++;
    stats.distinctDays.add(dayKey(e.timestamp));
  }

  // Build wallet stats: start from holders, merge claim data
  const walletStats: WalletStats[] = holders
    .filter(h => h.balance > 0)
    .map(h => {
      const claims = claimMap.get(h.wallet);
      return {
        wallet: h.wallet,
        balance: h.balance / Math.pow(10, decimals),
        claimCount: claims?.claimCount || 0,
        totalClaimed: claims?.totalClaimed || 0,
        distinctDays: claims?.distinctDays.size || 0,
      };
    });

  if (walletStats.length === 0) return [];

  // Global maxima for normalization
  const maxBalance = Math.max(...walletStats.map(w => w.balance), 1);
  const maxClaimed = Math.max(...walletStats.map(w => w.totalClaimed), 1);
  const maxDays = Math.max(...walletStats.map(w => w.distinctDays), 1);

  const hasClaims = claimEvents.length > 0;

  // Score each wallet
  const scored: WalletScore[] = walletStats.map(w => {
    // Balance score: log-scaled to reduce whale dominance
    const balanceRatio = Math.log10(w.balance + 1) / Math.log10(maxBalance + 1);

    let balanceScore: number;
    let claimScore: number;
    let consistencyScore: number;

    if (hasClaims) {
      // With claims: 50/30/20 split
      balanceScore = balanceRatio * 50;
      claimScore = (w.totalClaimed / maxClaimed) * 30;
      consistencyScore = (w.distinctDays / maxDays) * 20;
    } else {
      // No claims: balance is everything
      balanceScore = balanceRatio * 100;
      claimScore = 0;
      consistencyScore = 0;
    }

    const score = balanceScore + claimScore + consistencyScore;

    return {
      wallet: w.wallet,
      score: Math.round(score * 100) / 100,
      tier: 'OG' as ConvictionTier, // assigned below
      balanceScore: Math.round(balanceScore * 100) / 100,
      claimScore: Math.round(claimScore * 100) / 100,
      consistencyScore: Math.round(consistencyScore * 100) / 100,
      balance: Math.round(w.balance * 1000) / 1000,
      claimCount: w.claimCount,
      totalClaimed: w.totalClaimed,
      distinctDays: w.distinctDays,
    };
  });

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Assign tiers by percentile
  const total = scored.length;
  scored.forEach((w, i) => {
    const percentile = (i + 1) / total;
    for (const tier of TIER_ORDER) {
      if (percentile <= TIER_PERCENTILES[tier]) {
        w.tier = tier;
        break;
      }
    }
  });

  return scored;
}

export function getWalletRank(scores: WalletScore[], wallet: string): number {
  const idx = scores.findIndex(s => s.wallet === wallet);
  return idx === -1 ? -1 : idx + 1;
}

export function filterByTier(scores: WalletScore[], minTier: ConvictionTier): WalletScore[] {
  const minIdx = TIER_ORDER.indexOf(minTier);
  return scores.filter(s => TIER_ORDER.indexOf(s.tier) <= minIdx);
}
