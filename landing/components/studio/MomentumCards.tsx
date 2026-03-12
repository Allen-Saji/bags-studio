'use client';

import { motion } from 'framer-motion';
import { FeeShareInfo, PoolInfo } from '@/lib/types';

interface MomentumCardsProps {
  feeShare: FeeShareInfo | null;
  pool: PoolInfo | null;
}

function StatCard({
  label,
  value,
  sub,
  delay = 0,
}: {
  label: string;
  value: string;
  sub?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="p-5 rounded-xl bg-surface-2 border border-border-subtle"
    >
      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</div>
      <div className="text-xl font-mono font-bold text-white">{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
    </motion.div>
  );
}

export default function MomentumCards({ feeShare, pool }: MomentumCardsProps) {
  const fmt = (n: number, d = 2) => n.toLocaleString(undefined, { maximumFractionDigits: d });

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard
        label="Total Claimed"
        value={feeShare ? `${fmt(feeShare.totalClaimed)} SOL` : '—'}
        sub={feeShare ? `${feeShare.claimCount} claims` : undefined}
        delay={0}
      />
      <StatCard
        label="Unclaimed Fees"
        value={feeShare ? `${fmt(feeShare.totalUnclaimed)} SOL` : '—'}
        delay={0.05}
      />
      <StatCard
        label="Unique Claimers"
        value={feeShare ? feeShare.uniqueClaimers.toLocaleString() : '—'}
        delay={0.1}
      />
      <StatCard
        label="Pool Liquidity"
        value={pool ? `$${fmt(pool.liquidity, 0)}` : '—'}
        sub={pool ? `Vol 24h: $${fmt(pool.volume24h, 0)}` : undefined}
        delay={0.15}
      />
    </div>
  );
}
