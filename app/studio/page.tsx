'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import CoinSelector from '@/components/studio/CoinSelector';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then(r => r.json());

// Dummy quest activity that cycles through
const DUMMY_ACTIVITY = [
  { wallet: '7kYp...3xFm', action: 'completed quest', quest: 'Hold for 7 Days', token: 'SECURECLAW', points: 50, color: '#00E676' },
  { wallet: 'Hx4R...9vKe', action: 'referred', quest: '3 new holders', token: 'ROWBOAT', points: 100, color: '#C084FC' },
  { wallet: '3nBq...wL8z', action: 'completed quest', quest: 'First Trade', token: 'COMPOSIO', points: 25, color: '#60A5FA' },
  { wallet: 'Fm2Y...kR4p', action: 'reached tier', quest: 'Catalyst', token: 'BAGX', points: 200, color: '#FFD700' },
  { wallet: '9xTw...mN5j', action: 'completed quest', quest: 'Stack 10k Tokens', token: 'ATOMIC', points: 75, color: '#00E676' },
  { wallet: 'Bk7L...4eHn', action: 'submitted proof', quest: 'Post on X', token: 'MCH', points: 50, color: '#FF6B6B' },
  { wallet: 'Qp3W...rY8s', action: 'completed quest', quest: '30-Day Streak', token: 'BELLE', points: 150, color: '#C084FC' },
  { wallet: 'Dn9X...fK2m', action: 'referred', quest: '5 new holders', token: 'NERD', points: 200, color: '#60A5FA' },
  { wallet: 'Wz5T...hJ7q', action: 'completed quest', quest: 'Complete 5 Quests', token: 'SECURECLAW', points: 300, color: '#FFD700' },
  { wallet: 'Lm8R...xC3v', action: 'reached tier', quest: 'Champion', token: 'MOJO', points: 500, color: '#FFD700' },
];

const DUMMY_STATS = [
  { label: 'Active Tokens', value: '847', delta: '+12 today' },
  { label: 'Quests Completed', value: '23.4k', delta: '+341 today' },
  { label: 'Points Awarded', value: '1.8M', delta: '+48k today' },
  { label: 'Active Supporters', value: '12.6k', delta: '+89 today' },
];

const DUMMY_TRENDING_QUESTS = [
  { title: 'Diamond Hands Challenge', token: 'SECURECLAW', type: 'streak', completions: 847, maxCompletions: 1000, points: 200 },
  { title: 'Refer 3 Friends', token: 'ROWBOAT', type: 'referral_count', completions: 234, maxCompletions: 500, points: 100 },
  { title: 'Hold 50k Tokens', token: 'COMPOSIO', type: 'token_balance', completions: 156, maxCompletions: null, points: 150 },
  { title: 'First Trade on Bags', token: 'BAGX', type: 'trade_volume', completions: 1203, maxCompletions: null, points: 25 },
  { title: 'Post Your Stack on X', token: 'ATOMIC', type: 'social_share', completions: 89, maxCompletions: 200, points: 75 },
  { title: 'Reach Loyal Tier', token: 'MCH', type: 'tier_reached', completions: 412, maxCompletions: null, points: 100 },
];

interface TokenFeedItem {
  name: string;
  symbol: string;
  image: string;
  tokenMint: string;
  status: string;
}

function LiveActivityTicker() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % DUMMY_ACTIVITY.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-8 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 flex items-center gap-3"
        >
          <span className="inline-block h-2 w-2 rounded-full animate-pulse-dot shrink-0" style={{ background: DUMMY_ACTIVITY[currentIndex].color }} />
          <span className="text-[10px] sm:text-xs text-gray-400 font-mono truncate">
            <span className="text-white">{DUMMY_ACTIVITY[currentIndex].wallet}</span>
            {' '}{DUMMY_ACTIVITY[currentIndex].action}{' '}
            <span className="text-green">{DUMMY_ACTIVITY[currentIndex].quest}</span>
            <span className="hidden sm:inline"> on <span className="text-gray-300">${DUMMY_ACTIVITY[currentIndex].token}</span></span>
            {' '}<span className="text-green">+{DUMMY_ACTIVITY[currentIndex].points}pts</span>
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function StatsBar() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {DUMMY_STATS.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.08 }}
          className="rounded-xl border border-border-subtle bg-surface p-4 group hover:border-green/20 transition-colors"
        >
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{stat.label}</div>
          <div className="text-xl sm:text-2xl font-mono font-bold text-white">{stat.value}</div>
          <div className="text-[10px] text-green font-mono mt-1">{stat.delta}</div>
        </motion.div>
      ))}
    </div>
  );
}

function TrendingQuests() {
  const typeIcons: Record<string, string> = {
    streak: '🔥',
    referral_count: '🔗',
    token_balance: '💰',
    trade_volume: '📊',
    social_share: '📢',
    tier_reached: '🏆',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-display font-bold flex items-center gap-2">
          <span className="text-green">★</span> Trending Quests
        </h3>
        <div className="flex items-center gap-1.5 text-[10px] text-green font-mono">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-green animate-pulse" />
          Live
        </div>
      </div>
      <div className="space-y-2">
        {DUMMY_TRENDING_QUESTS.map((quest, i) => (
          <motion.div
            key={quest.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.4 + i * 0.06 }}
            className="group flex items-center gap-3 rounded-lg border border-border-subtle bg-surface p-3 hover:border-green/20 hover:bg-surface-2 transition-all cursor-pointer"
          >
            <span className="text-base">{typeIcons[quest.type] || '⭐'}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-medium text-white truncate">{quest.title}</span>
                <span className="hidden sm:inline shrink-0 text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-surface-2 border border-border-subtle text-gray-500">${quest.token}</span>
              </div>
              {quest.maxCompletions && (
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-1 flex-1 rounded-full bg-border-strong overflow-hidden">
                    <div className="h-full rounded-full bg-green/60 transition-all" style={{ width: `${(quest.completions / quest.maxCompletions) * 100}%` }} />
                  </div>
                  <span className="text-[9px] text-gray-500 font-mono shrink-0">{quest.completions}/{quest.maxCompletions}</span>
                </div>
              )}
              {!quest.maxCompletions && (
                <div className="text-[10px] text-gray-500 font-mono mt-0.5">{quest.completions.toLocaleString()} completed</div>
              )}
            </div>
            <div className="text-right shrink-0">
              <div className="text-sm font-mono font-bold text-green">+{quest.points}</div>
              <div className="text-[9px] text-gray-500">pts</div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function TokenFeed({ tokens }: { tokens: TokenFeedItem[] }) {
  if (!tokens.length) return null;

  // Duplicate for infinite scroll effect
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

function RecentActivity() {
  const [visibleItems, setVisibleItems] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleItems(prev => {
        if (prev >= DUMMY_ACTIVITY.length) return prev;
        return prev + 1;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-display font-bold flex items-center gap-2">
          <span className="text-green">⚡</span> Recent Activity
        </h3>
      </div>
      <div className="rounded-xl border border-border-subtle bg-surface overflow-hidden">
        <div className="divide-y divide-border-subtle">
          {DUMMY_ACTIVITY.slice(0, visibleItems).map((item, i) => (
            <motion.div
              key={`${item.wallet}-${i}`}
              initial={i >= 5 ? { opacity: 0, height: 0 } : { opacity: 1 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3 px-4 py-3"
            >
              <span className="inline-block h-2 w-2 rounded-full shrink-0" style={{ background: item.color }} />
              <div className="flex-1 min-w-0">
                <span className="text-xs">
                  <span className="text-gray-300 font-mono">{item.wallet}</span>
                  <span className="text-gray-500"> {item.action} </span>
                  <span className="text-white">{item.quest}</span>
                </span>
              </div>
              <span className="hidden sm:inline text-[10px] font-mono text-gray-500 shrink-0">${item.token}</span>
              <span className="text-[10px] sm:text-xs font-mono font-bold text-green shrink-0">+{item.points}</span>
            </motion.div>
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
      {/* Header with live ticker */}
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
        <div className="rounded-lg border border-border-subtle bg-surface px-4 py-2.5">
          <LiveActivityTicker />
        </div>
      </div>

      {/* Stats */}
      <StatsBar />

      {/* Connect your coin */}
      <CoinSelector />

      {/* Token feed */}
      <TokenFeed tokens={tokens} />

      {/* Two columns: trending quests + recent activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <TrendingQuests />
        <RecentActivity />
      </div>
    </div>
  );
}
