'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { EngagementLeaderboardEntry } from '@/lib/types';

interface EngagementLeaderboardProps {
  entries: EngagementLeaderboardEntry[];
  total: number;
  mint: string;
}

export default function EngagementLeaderboard({
  entries,
  total,
  mint,
}: EngagementLeaderboardProps) {
  const [page, setPage] = useState(0);
  const perPage = 25;
  const paged = entries.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(entries.length / perPage);

  const handleExportCSV = () => {
    const header = 'rank,wallet,total_points,hold,quest,referral,streak\n';
    const rows = entries
      .map(
        (e, i) =>
          `${i + 1},${e.wallet},${e.total_points},${e.hold_points},${e.quest_points},${e.referral_points},${e.streak_points}`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `engagement-leaderboard-${mint}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-border-subtle p-8 text-center">
        <p className="text-gray-500 text-sm mb-1">No engagement data yet</p>
        <p className="text-gray-600 text-xs">Points will appear here as supporters engage.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-display font-bold">
          Engagement Leaderboard
          <span className="text-sm font-normal text-gray-500 ml-2">
            ({total} wallets)
          </span>
        </h2>
        <button
          onClick={handleExportCSV}
          className="px-3 py-1.5 text-xs font-mono rounded-lg bg-surface-2 border border-border-subtle text-gray-400 hover:text-green hover:border-green/30 transition-colors"
        >
          Export CSV
        </button>
      </div>

      <div className="rounded-xl border border-border-subtle overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-2 text-gray-500 text-xs uppercase tracking-wider">
              <th className="px-4 py-3 text-left w-12">#</th>
              <th className="px-4 py-3 text-left">Wallet</th>
              <th className="px-4 py-3 text-right">Points</th>
              <th className="px-4 py-3 text-right hidden md:table-cell">Hold</th>
              <th className="px-4 py-3 text-right hidden md:table-cell">Quest</th>
              <th className="px-4 py-3 text-right hidden lg:table-cell">Referral</th>
              <th className="px-4 py-3 text-right hidden lg:table-cell">Streak</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((e, i) => (
              <motion.tr
                key={e.wallet}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className="border-t border-border-subtle hover:bg-surface-2/50 transition-colors"
              >
                <td className="px-4 py-3 text-gray-500 font-mono">
                  {e.rank || page * perPage + i + 1}
                </td>
                <td className="px-4 py-3 font-mono text-gray-300">
                  {e.wallet.slice(0, 6)}...{e.wallet.slice(-4)}
                </td>
                <td className="px-4 py-3 text-right font-mono font-bold text-green">
                  {Math.round(e.total_points).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right font-mono text-gray-400 hidden md:table-cell">
                  {Math.round(e.hold_points)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-gray-400 hidden md:table-cell">
                  {Math.round(e.quest_points)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-gray-400 hidden lg:table-cell">
                  {Math.round(e.referral_points)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-gray-400 hidden lg:table-cell">
                  {Math.round(e.streak_points)}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1.5 text-xs font-mono rounded-lg bg-surface-2 border border-border-subtle text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
          >
            Prev
          </button>
          <span className="text-xs text-gray-500 font-mono">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-3 py-1.5 text-xs font-mono rounded-lg bg-surface-2 border border-border-subtle text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
