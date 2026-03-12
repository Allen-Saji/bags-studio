'use client';

import { WalletScore, ConvictionTier, Campaign } from '@/lib/types';
import { filterByTier } from '@/lib/conviction';
import TierBadge from './TierBadge';

interface EligibilityTableProps {
  scores: WalletScore[];
  campaign: Campaign;
}

export default function EligibilityTable({ scores, campaign }: EligibilityTableProps) {
  let eligible = filterByTier(scores, campaign.tier_threshold);
  if (campaign.max_wallets) {
    eligible = eligible.slice(0, campaign.max_wallets);
  }

  const handleExport = () => {
    const header = 'wallet,score,tier,claims,total_claimed\n';
    const rows = eligible
      .map(s => `${s.wallet},${s.score},${s.tier},${s.claimCount},${s.totalClaimed}`)
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${campaign.name.replace(/\s+/g, '-').toLowerCase()}-eligible.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-display font-bold">Eligible Wallets</h3>
          <p className="text-sm text-gray-500">
            {eligible.length} wallets at {campaign.tier_threshold} tier or above
            {campaign.max_wallets ? ` (capped at ${campaign.max_wallets})` : ''}
          </p>
        </div>
        <button
          onClick={handleExport}
          className="px-4 py-2 text-sm font-mono rounded-lg bg-green text-black font-semibold hover:bg-green-dark transition-colors"
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
              <th className="px-4 py-3 text-left">Tier</th>
              <th className="px-4 py-3 text-right">Score</th>
            </tr>
          </thead>
          <tbody>
            {eligible.slice(0, 50).map((s, i) => (
              <tr
                key={s.wallet}
                className="border-t border-border-subtle hover:bg-surface-2/50 transition-colors"
              >
                <td className="px-4 py-2.5 text-gray-500 font-mono">{i + 1}</td>
                <td className="px-4 py-2.5 font-mono text-gray-300">
                  {s.wallet.slice(0, 6)}...{s.wallet.slice(-4)}
                </td>
                <td className="px-4 py-2.5">
                  <TierBadge tier={s.tier} size="sm" />
                </td>
                <td className="px-4 py-2.5 text-right font-mono font-bold">
                  {s.score.toFixed(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {eligible.length > 50 && (
          <div className="px-4 py-3 text-center text-xs text-gray-500 bg-surface-2">
            Showing 50 of {eligible.length} — export CSV for full list
          </div>
        )}
      </div>
    </div>
  );
}
