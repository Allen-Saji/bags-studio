'use client';

import { use, useMemo } from 'react';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletContextProvider } from '@/lib/wallet-context';
import WalletStatus from '@/components/studio/WalletStatus';
import TierBadge from '@/components/studio/TierBadge';
import { Campaign, WalletScore } from '@/lib/types';
import { TIER_ORDER, TIER_COLORS } from '@/lib/constants';
import { filterByTier } from '@/lib/conviction';

const fetcher = (url: string) => fetch(url).then(r => {
  if (!r.ok) throw new Error(`${r.status}`);
  return r.json();
});

function CampaignContent({ id }: { id: string }) {
  const { publicKey, connected } = useWallet();

  const { data: campaign, isLoading: campaignLoading, error: campaignError } = useSWR<Campaign>(
    `/api/campaigns/${id}`,
    fetcher
  );

  const { data: scoreData, isLoading: scoresLoading, error: scoresError } = useSWR(
    campaign ? `/api/score/${campaign.mint_address}` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  const scores: WalletScore[] = scoreData?.scores || [];

  const myScore = useMemo(() => {
    if (!publicKey || !scores.length) return null;
    const wallet = publicKey.toBase58();
    return scores.find(s => s.wallet === wallet) || null;
  }, [publicKey, scores]);

  const myRank = useMemo(() => {
    if (!myScore) return -1;
    return scores.indexOf(myScore) + 1;
  }, [myScore, scores]);

  const eligible = useMemo(() => {
    if (!campaign || !scores.length) return [];
    let list = filterByTier(scores, campaign.tier_threshold);
    if (campaign.max_wallets) list = list.slice(0, campaign.max_wallets);
    return list;
  }, [campaign, scores]);

  const isEligible = useMemo(() => {
    if (!myScore) return false;
    return eligible.some(e => e.wallet === myScore.wallet);
  }, [myScore, eligible]);

  if (campaignLoading && !campaignError) {
    return (
      <div className="flex justify-center pt-24">
        <div className="w-6 h-6 border-2 border-green/30 border-t-green rounded-full animate-spin" />
      </div>
    );
  }

  if (!campaign || campaignError) {
    return (
      <div className="text-center pt-24">
        <h1 className="text-2xl font-display font-bold mb-2">Campaign Not Found</h1>
        <p className="text-gray-500">This campaign may have been removed or doesn&apos;t exist.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pt-8">
      {/* Campaign info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h1 className="text-3xl font-display font-bold mb-2">{campaign.name}</h1>
        {campaign.description && (
          <p className="text-gray-400">{campaign.description}</p>
        )}
        <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-500 font-mono">
          <span className="uppercase">{campaign.type}</span>
          <span>Min: {campaign.tier_threshold}</span>
          <span>{eligible.length} eligible</span>
        </div>
      </motion.div>

      {/* Wallet check */}
      {!connected ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center p-8 rounded-xl border border-border-subtle bg-surface-2"
        >
          <p className="text-gray-300 mb-4">Connect your wallet to check eligibility</p>
          <WalletStatus />
        </motion.div>
      ) : scoresError ? (
        <div className="text-center p-8 rounded-xl border border-red/20 bg-red/5">
          <p className="text-red text-sm mb-1">Failed to load scores</p>
          <p className="text-gray-500 text-xs">Please try again later.</p>
        </div>
      ) : scoresLoading ? (
        <div className="text-center p-8">
          <div className="w-6 h-6 border-2 border-green/30 border-t-green rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Checking your score...</p>
        </div>
      ) : myScore ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Score card */}
          <div
            className={`p-6 rounded-xl border ${
              isEligible
                ? 'border-green/30 bg-green/5'
                : 'border-border-subtle bg-surface-2'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">Your Score</div>
                <div className="text-3xl font-mono font-bold">{myScore.score.toFixed(1)}</div>
              </div>
              <TierBadge tier={myScore.tier} size="lg" />
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              {[
                { label: 'Balance', value: myScore.balanceScore, max: 50 },
                { label: 'Claims', value: myScore.claimScore, max: 30 },
                { label: 'Consistency', value: myScore.consistencyScore, max: 20 },
              ].map(s => (
                <div key={s.label}>
                  <div className="text-xs text-gray-500">{s.label}</div>
                  <div className="text-sm font-mono">{s.value.toFixed(1)}/{s.max}</div>
                  <div className="mt-1 h-1 rounded-full bg-surface">
                    <div
                      className="h-full rounded-full bg-green"
                      style={{ width: `${(s.value / s.max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
              <div className="text-sm text-gray-400">
                Rank <span className="font-mono font-bold text-white">#{myRank}</span> of{' '}
                {scores.length}
              </div>
              <div className={`text-sm font-semibold ${isEligible ? 'text-green' : 'text-red'}`}>
                {isEligible ? '✓ Eligible' : '✗ Not eligible'}
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="text-center p-8 rounded-xl border border-border-subtle bg-surface-2">
          <p className="text-gray-400">
            Your wallet doesn&apos;t hold this token.
          </p>
        </div>
      )}

      {/* Anonymized leaderboard */}
      {scores.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <h2 className="text-lg font-display font-bold mb-4">Top Supporters</h2>
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
                {scores.slice(0, 20).map((s, i) => {
                  const isMe = publicKey && s.wallet === publicKey.toBase58();
                  return (
                    <tr
                      key={i}
                      className={`border-t border-border-subtle ${
                        isMe ? 'bg-green/5' : ''
                      }`}
                    >
                      <td className="px-4 py-2.5 text-gray-500 font-mono">{i + 1}</td>
                      <td className="px-4 py-2.5 font-mono text-gray-400">
                        {isMe ? (
                          <span className="text-green font-bold">You</span>
                        ) : (
                          `${s.wallet.slice(0, 4)}...${s.wallet.slice(-4)}`
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        <TierBadge tier={s.tier} size="sm" />
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono">
                        {s.score.toFixed(1)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Footer */}
      <div className="mt-12 text-center text-xs text-gray-600">
        Powered by{' '}
        <a href="/" className="text-green hover:underline">
          BagsStudio
        </a>
      </div>
    </div>
  );
}

export default function PublicCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <WalletContextProvider>
      <div className="min-h-screen bg-black text-white p-6">
        <header className="flex justify-end mb-6 max-w-2xl mx-auto">
          <WalletStatus />
        </header>
        <CampaignContent id={id} />
      </div>
    </WalletContextProvider>
  );
}
