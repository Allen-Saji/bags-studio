'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { WalletScore, ConvictionTier } from '@/lib/types';
import { TIER_ORDER } from '@/lib/constants';
import TierBadge from './TierBadge';

interface ConvictionLeaderboardProps {
  scores: WalletScore[];
  mint: string;
  compact?: boolean;
}

export default function ConvictionLeaderboard({
  scores,
  mint,
  compact = false,
}: ConvictionLeaderboardProps) {
  const [filterTier, setFilterTier] = useState<ConvictionTier | 'all'>('all');
  const [page, setPage] = useState(0);
  const perPage = compact ? 10 : 25;

  const filtered =
    filterTier === 'all' ? scores : scores.filter(s => s.tier === filterTier);

  const paged = filtered.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const handleExportCSV = () => {
    const data = filtered;
    const header = 'rank,wallet,score,tier,claims,total_claimed,first_claim,last_claim\n';
    const rows = data
      .map(
        (s, i) =>
          `${i + 1},${s.wallet},${s.score},${s.tier},${s.claimCount},${s.totalClaimed},${s.firstClaimAt},${s.lastClaimAt}`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conviction-scores-${mint}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-display font-bold">
          Supporter Leaderboard
          <span className="text-sm font-normal text-gray-500 ml-2">
            ({filtered.length} wallets)
          </span>
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 text-xs font-mono rounded-lg bg-surface-2 border border-border-subtle text-gray-400 hover:text-green hover:border-green/30 transition-colors"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Tier filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => { setFilterTier('all'); setPage(0); }}
          className={`px-3 py-1 text-xs rounded-full font-mono transition-colors ${
            filterTier === 'all'
              ? 'bg-green/20 text-green border border-green/30'
              : 'bg-surface-2 text-gray-400 border border-border-subtle hover:border-green/20'
          }`}
        >
          All
        </button>
        {TIER_ORDER.map(tier => {
          const count = scores.filter(s => s.tier === tier).length;
          return (
            <button
              key={tier}
              onClick={() => { setFilterTier(tier); setPage(0); }}
              className={`px-3 py-1 text-xs rounded-full font-mono transition-colors ${
                filterTier === tier
                  ? 'bg-green/20 text-green border border-green/30'
                  : 'bg-surface-2 text-gray-400 border border-border-subtle hover:border-green/20'
              }`}
            >
              {tier} ({count})
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border-subtle overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-2 text-gray-500 text-xs uppercase tracking-wider">
              <th className="px-4 py-3 text-left w-12">#</th>
              <th className="px-4 py-3 text-left">Wallet</th>
              <th className="px-4 py-3 text-left">Tier</th>
              <th className="px-4 py-3 text-right">Score</th>
              <th className="px-4 py-3 text-right hidden md:table-cell">Claims</th>
              <th className="px-4 py-3 text-right hidden lg:table-cell">Total Claimed</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((s, i) => {
              const globalRank = scores.indexOf(s) + 1;
              return (
                <motion.tr
                  key={s.wallet}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-t border-border-subtle hover:bg-surface-2/50 transition-colors"
                >
                  <td className="px-4 py-3 text-gray-500 font-mono">{globalRank}</td>
                  <td className="px-4 py-3 font-mono text-gray-300">
                    {s.wallet.slice(0, 6)}...{s.wallet.slice(-4)}
                  </td>
                  <td className="px-4 py-3">
                    <TierBadge tier={s.tier} size="sm" />
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-white">
                    {s.score.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-gray-400 hidden md:table-cell">
                    {s.claimCount}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-gray-400 hidden lg:table-cell">
                    {s.totalClaimed.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1.5 text-xs font-mono rounded-lg bg-surface-2 border border-border-subtle text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
          >
            ← Prev
          </button>
          <span className="text-xs text-gray-500 font-mono">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-3 py-1.5 text-xs font-mono rounded-lg bg-surface-2 border border-border-subtle text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
