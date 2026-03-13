'use client';

import { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion } from 'framer-motion';
import useSWR from 'swr';
import { RewardClaim } from '@/lib/types';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function ClaimReward({ mint }: { mint: string }) {
  const { publicKey } = useWallet();
  const wallet = publicKey?.toBase58();
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const { data, mutate } = useSWR(
    wallet ? `/api/engage/${mint}/rewards/${wallet}` : null,
    fetcher,
  );

  const claims: RewardClaim[] = data?.claims || [];
  const totalClaimable = data?.totalClaimable || 0;
  const unclaimed = claims.filter(c => !c.claimed);

  const handleClaim = useCallback(async (claimId: string) => {
    setClaimingId(claimId);
    setError('');

    try {
      // In production this would sign a SOL transfer tx.
      // For now, mark as claimed with a placeholder signature.
      const res = await fetch(`/api/engage/${mint}/rewards/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claim_id: claimId, signature: 'pending' }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Claim failed');
      }

      mutate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Claim failed');
    } finally {
      setClaimingId(null);
    }
  }, [mint, mutate]);

  if (!wallet) {
    return (
      <div className="rounded-xl border border-border-subtle p-5">
        <h3 className="text-sm font-display font-bold mb-2">Engagement Rewards</h3>
        <p className="text-xs text-gray-500">Connect wallet to see your rewards.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border-subtle p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-display font-bold">Engagement Rewards</h3>
        {totalClaimable > 0 && (
          <span className="text-sm font-mono font-bold text-green">
            {(totalClaimable / 1e9).toFixed(4)} SOL
          </span>
        )}
      </div>

      {unclaimed.length === 0 ? (
        <p className="text-xs text-gray-500 text-center py-2">No unclaimed rewards.</p>
      ) : (
        <div className="space-y-2">
          {unclaimed.map(claim => (
            <div
              key={claim.id}
              className="flex items-center justify-between p-3 rounded-lg bg-surface-2 border border-border-subtle"
            >
              <div>
                <div className="text-xs font-mono text-gray-300">
                  {(Number(claim.reward_lamports) / 1e9).toFixed(6)} SOL
                </div>
                <div className="text-[10px] text-gray-600">
                  {Math.round(Number(claim.points_at_snapshot))} pts
                </div>
              </div>
              <button
                onClick={() => handleClaim(claim.id)}
                disabled={claimingId === claim.id}
                className="px-3 py-1.5 text-xs font-mono rounded-lg bg-green/20 text-green border border-green/30 hover:bg-green/30 transition-colors disabled:opacity-50"
              >
                {claimingId === claim.id ? '...' : 'Claim'}
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-xs text-red mt-2">{error}</p>}
    </motion.div>
  );
}
