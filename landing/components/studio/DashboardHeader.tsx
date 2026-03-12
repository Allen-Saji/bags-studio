'use client';

import { motion } from 'framer-motion';
import { TokenMetadata, FeeShareInfo } from '@/lib/types';

interface DashboardHeaderProps {
  token: TokenMetadata;
  feeShare: FeeShareInfo | null;
  totalSupporters: number;
}

export default function DashboardHeader({ token, feeShare, totalSupporters }: DashboardHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-5 mb-8"
    >
      {token.image && (
        <img
          src={token.image}
          alt={token.name}
          className="w-16 h-16 rounded-full border-2 border-border-subtle"
        />
      )}
      <div className="flex-1">
        <h1 className="text-2xl font-display font-bold flex items-center gap-3">
          {token.name}
          <span className="text-sm font-mono text-gray-400">${token.symbol}</span>
        </h1>
        <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
          <span className="font-mono">{token.mint.slice(0, 8)}...{token.mint.slice(-4)}</span>
          {totalSupporters > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green" />
              {totalSupporters} supporters
            </span>
          )}
        </div>
      </div>
      {feeShare && (
        <div className="text-right">
          <div className="text-xs text-gray-500 uppercase tracking-wider">Lifetime Fees</div>
          <div className="text-xl font-mono font-bold text-green">
            {feeShare.totalFeesEarned.toLocaleString(undefined, { maximumFractionDigits: 2 })} SOL
          </div>
        </div>
      )}
    </motion.div>
  );
}
