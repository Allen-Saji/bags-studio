'use client';

import { use } from 'react';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import DashboardHeader from '@/components/studio/DashboardHeader';
import MomentumCards from '@/components/studio/MomentumCards';
import ConvictionLeaderboard from '@/components/studio/ConvictionLeaderboard';
import ClaimableCard from '@/components/studio/ClaimableCard';
import ReferralCard from '@/components/studio/ReferralCard';
import ActivityFeed from '@/components/studio/ActivityFeed';
import EngagementLeaderboard from '@/components/studio/EngagementLeaderboard';
import StakingCard from '@/components/studio/StakingCard';
import CreatorLockBadge from '@/components/studio/CreatorLockBadge';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then(r => {
  if (!r.ok) throw new Error(`${r.status}`);
  return r.json();
});

export default function CreatorDashboard({
  params,
}: {
  params: Promise<{ mint: string }>;
}) {
  const { mint } = use(params);

  const { data, isLoading, error } = useSWR(
    `/api/dashboard/${mint}`,
    fetcher,
    { revalidateOnFocus: false },
  );

  const { data: leaderboardData } = useSWR(
    `/api/engage/${mint}/leaderboard`,
    fetcher,
    { revalidateOnFocus: false },
  );

  if (error) {
    return (
      <div className="max-w-2xl mx-auto pt-12 text-center">
        <div className="text-red text-lg mb-2">Token not found</div>
        <p className="text-gray-500 text-sm mb-6">
          This mint address doesn&apos;t appear to be a valid Bags coin.
        </p>
        <Link
          href="/studio"
          className="text-green hover:underline text-sm"
        >
          ← Try another coin
        </Link>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center pt-24">
        <div className="w-6 h-6 border-2 border-green/30 border-t-green rounded-full animate-spin" />
      </div>
    );
  }

  // Build token metadata from consolidated response
  const creator = data.creators?.find((c: { isCreator: boolean }) => c.isCreator);
  const token = {
    mint,
    name: data.token.name || creator?.bagsUsername || mint.slice(0, 8),
    symbol: data.token.symbol || '',
    image: data.token.image || creator?.pfp || '',
    creator: creator?.wallet,
    creators: data.creators || [],
    description: data.token.description || '',
  };

  // Build fee share info
  const feeShare = data.claimStats?.length ? {
    totalFeesLamports: data.lifetimeFees || '0',
    claimStats: data.claimStats,
    uniqueClaimers: data.claimStats.length,
    totalClaimedLamports: data.claimStats.reduce(
      (sum: number, s: { totalClaimed: string }) => sum + parseFloat(s.totalClaimed || '0'),
      0
    ),
  } : null;

  return (
    <div>
      <DashboardHeader
        token={token}
        totalSupporters={data.totalSupporters || 0}
      />

      <MomentumCards feeShare={feeShare} pool={data.pool} />

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap gap-3 mb-8"
      >
        {[
          { href: `/studio/${mint}/community`, label: 'Community' },
          { href: `/studio/${mint}/trade`, label: 'Trade' },
          // { href: `/studio/${mint}/apps`, label: 'Apps' }, // removed — placeholder
          { href: `/studio/${mint}/quests`, label: 'Quests' },
          { href: `/studio/${mint}/rewards`, label: 'Rewards' },
          // { href: `/studio/${mint}/campaigns`, label: 'Campaigns' }, // v2
        ].map(link => (
          <Link
            key={link.href}
            href={link.href}
            className="px-4 py-2 rounded-lg bg-surface-2 border border-border-subtle text-sm text-gray-300 hover:text-green hover:border-green/30 transition-colors"
          >
            {link.label} →
          </Link>
        ))}
      </motion.div>

      {/* Creator Lock Badge + Claimable fees */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
      >
        <CreatorLockBadge mint={mint} />
        <ClaimableCard mint={mint} />
      </motion.div>

      {/* Staking */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28 }}
        className="mb-8"
      >
        <StakingCard mint={mint} />
      </motion.div>

      {/* Referral & Activity */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
      >
        <ReferralCard mint={mint} />
        <ActivityFeed mint={mint} />
      </motion.div>

      {/* Engagement Leaderboard */}
      {leaderboardData?.entries?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-8"
        >
          <EngagementLeaderboard
            entries={leaderboardData.entries}
            total={leaderboardData.total || leaderboardData.entries.length}
            mint={mint}
          />
        </motion.div>
      )}

      {/* Conviction Leaderboard */}
      {data.scores?.length > 0 ? (
        <ConvictionLeaderboard scores={data.scores} mint={mint} />
      ) : (
        <div className="rounded-xl border border-border-subtle p-8 text-center">
          <p className="text-gray-500 text-sm mb-1">No supporters yet</p>
          <p className="text-gray-600 text-xs">No token holders found.</p>
        </div>
      )}
    </div>
  );
}
