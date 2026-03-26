'use client';

import useSWR from 'swr';
import { motion } from 'framer-motion';
import CoinSelector from '@/components/studio/CoinSelector';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface TokenFeedItem {
  name: string;
  symbol: string;
  image: string;
  tokenMint: string;
  status: string;
}

function TokenFeed({ tokens }: { tokens: TokenFeedItem[] }) {
  if (!tokens.length) return null;

  const displayTokens = [...tokens, ...tokens];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-display font-bold flex items-center gap-2">
          <span className="text-green">◆</span> Recently Launched on Bags
        </h3>
        <span className="text-[10px] text-gray-500 font-mono">Scroll →</span>
      </div>
      <div className="relative overflow-hidden">
        <div className="flex gap-3 animate-scroll-x">
          {displayTokens.map((token, i) => (
            <Link
              key={`${token.tokenMint}-${i}`}
              href={`/studio/${token.tokenMint}`}
              className="shrink-0 w-[150px] sm:w-[180px] rounded-xl border border-border-subtle bg-surface p-3 hover:border-green/20 hover:bg-surface-2 transition-all group"
            >
              <div className="flex items-center gap-2.5 mb-2">
                <img
                  src={token.image}
                  alt={token.name}
                  className="w-8 h-8 rounded-full border border-border-subtle object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/mascot.png'; }}
                />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate group-hover:text-green transition-colors">{token.name}</div>
                  <div className="text-[10px] font-mono text-gray-500">${token.symbol}</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-green/10 border border-green/20 text-green">
                  {token.status === 'MIGRATED' ? 'Live' : 'Pre-grad'}
                </span>
                <span className="text-[10px] text-gray-500 group-hover:text-green transition-colors">View →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function StudioPage() {
  const { data } = useSWR('/api/bags/token-launch/feed', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  const tokens: TokenFeedItem[] = (data?.response || [])
    .filter((t: TokenFeedItem) => t.image && t.name && t.name.length > 1)
    .slice(0, 12);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl sm:text-3xl font-display font-bold">
            Welcome to <span className="text-green">BagsStudio</span>
          </h1>
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-green/20 bg-green/5">
            <span className="inline-block h-2 w-2 rounded-full bg-green animate-pulse-dot" />
            <span className="text-[10px] text-green font-mono uppercase tracking-wider">Network Live</span>
          </div>
        </div>
        <p className="text-gray-400 text-sm mb-4">
          The creator studio for post-launch community growth. Analyze, engage, and reward your supporters.
        </p>
      </div>

      {/* Connect your coin */}
      <CoinSelector />

      {/* Real token feed from Bags API */}
      <TokenFeed tokens={tokens} />
    </div>
  );
}
