'use client';

import { motion } from 'framer-motion';

interface BagsApp {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
}

const BAGS_APPS: BagsApp[] = [
  {
    id: 'dividends-bot',
    name: 'DividendsBot',
    description: 'Auto-distribute fees to top token holders based on balance.',
    icon: '\uD83D\uDCB0',
    category: 'Distribution',
  },
  {
    id: 'compound-liquidity',
    name: 'Compound Liquidity',
    description: 'Auto-compound LP fees back into the liquidity pool.',
    icon: '\uD83D\uDD04',
    category: 'Liquidity',
  },
  {
    id: 'bags-amm',
    name: 'BagsAMM',
    description: 'Setup multi-party fee vaults for reward distribution.',
    icon: '\u26A1',
    category: 'Trading',
  },
  {
    id: 'dex-boosts',
    name: 'DEX Boosts',
    description: 'Boost token visibility on Dexscreener and other aggregators.',
    icon: '\uD83D\uDE80',
    category: 'Marketing',
  },
  {
    id: 'twitter-connect',
    name: 'X (Twitter)',
    description: 'Connect X accounts for social fee sharing and verification.',
    icon: '\uD83D\uDC26',
    category: 'Social',
  },
];

interface AppsMarketplaceProps {
  mint: string;
}

export default function AppsMarketplace({ mint }: AppsMarketplaceProps) {
  return (
    <div>
      <h2 className="text-lg font-display font-bold mb-6">Bags Apps</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {BAGS_APPS.map((app, i) => (
          <motion.div
            key={app.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-xl border border-border-subtle p-5 hover:border-green/20 hover:bg-surface-2/50 transition-all group"
          >
            <div className="flex items-start gap-3 mb-3">
              <span className="text-2xl">{app.icon}</span>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-white">{app.name}</h3>
                <span className="text-[10px] font-mono text-gray-500">{app.category}</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-4">{app.description}</p>
            <button className="w-full py-2 rounded-lg bg-surface-2 border border-border-subtle text-xs font-mono text-gray-400 group-hover:text-green group-hover:border-green/30 transition-colors">
              Configure
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
