'use client';

import { motion } from 'framer-motion';
import { TokenMetadata } from '@/lib/types';

interface DashboardHeaderProps {
  token: TokenMetadata;
  totalSupporters: number;
}

export default function DashboardHeader({ token, totalSupporters }: DashboardHeaderProps) {
  const creator = token.creators?.find(c => c.isCreator);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="flex items-start gap-5">
        {token.image && (
          <img
            src={token.image}
            alt={token.name}
            className="w-16 h-16 rounded-full border-2 border-border-subtle"
          />
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-display font-bold flex items-center gap-3">
            {token.name}
            {token.symbol && (
              <span className="text-sm font-mono text-gray-400">${token.symbol}</span>
            )}
          </h1>
          {token.description && (
            <p className="text-sm text-gray-400 mt-1 line-clamp-2">{token.description}</p>
          )}
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
            <span className="font-mono">{token.mint.slice(0, 8)}...{token.mint.slice(-4)}</span>
            {totalSupporters > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green" />
                {totalSupporters} supporters
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Creator info */}
      {creator && (
        <div className="flex items-center gap-3 mt-4 p-3 rounded-lg bg-surface-2 border border-border-subtle">
          {creator.pfp && (
            <img src={creator.pfp} alt="" className="w-8 h-8 rounded-full" />
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-300">
              {creator.providerUsername || creator.bagsUsername || creator.username}
            </div>
            <div className="text-xs text-gray-500 font-mono truncate">
              {creator.wallet}
            </div>
          </div>
          <span className="text-xs text-green font-mono px-2 py-1 rounded-full bg-green/10 border border-green/20">
            Creator
          </span>
        </div>
      )}
    </motion.div>
  );
}
