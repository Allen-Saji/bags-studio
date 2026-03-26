'use client';

import { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { Transaction } from '@solana/web3.js';
import { motion } from 'framer-motion';
import useSWR from 'swr';
import { RewardClaim } from '@/lib/types';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function ClaimReward({ mint }: { mint: string }) {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const wallet = publicKey?.toBase58();
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [txSig, setTxSig] = useState('');

  const { data, mutate } = useSWR(
    wallet ? `/api/engage/${mint}/rewards/${wallet}` : null,
    fetcher,
  );

  const claims: RewardClaim[] = data?.claims || [];
  const totalClaimable = data?.totalClaimable || 0;
  const unclaimed = claims.filter(c => !c.claimed);

  const handleClaim = useCallback(async (claimId: string) => {
    if (!wallet || !signTransaction) return;
    setClaimingId(claimId);
    setError('');
    setTxSig('');

    try {
      // Step 1: Get unsigned claim transaction from server
      const res = await fetch(`/api/engage/${mint}/rewards/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claim_id: claimId, wallet }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to build claim transaction');
      }

      const { transaction } = await res.json();

      // Step 2: Sign and send
      const tx = Transaction.from(Buffer.from(transaction, 'base64'));
      const signed = await signTransaction(tx);
      const sig = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(sig, 'confirmed');

      setTxSig(sig);

      // Step 3: Mark claimed in DB with real signature
      await fetch(`/api/engage/${mint}/rewards/claim`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claim_id: claimId, signature: sig }),
      });

      mutate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Claim failed');
    } finally {
      setClaimingId(null);
    }
  }, [mint, wallet, signTransaction, connection, mutate]);

  if (!wallet) {
    return (
      <div className="rounded-xl border border-border-subtle p-5">
        <h3 className="text-sm font-display font-bold mb-2">Engagement Rewards</h3>
        <p className="text-xs text-gray-500">Connect a wallet to claim rewards.</p>
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
                disabled={claimingId === claim.id || !signTransaction}
                className="px-3 py-1.5 text-xs font-mono rounded-lg bg-green/20 text-green border border-green/30 hover:bg-green/30 transition-colors disabled:opacity-50"
              >
                {claimingId === claim.id ? 'Signing...' : 'Claim'}
              </button>
            </div>
          ))}
        </div>
      )}

      {txSig && (
        <div className="mt-3 p-2 rounded-lg bg-green/5 border border-green/20">
          <p className="text-xs text-green mb-1">Claimed successfully!</p>
          <a
            href={`https://solscan.io/tx/${txSig}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-mono text-green/70 hover:text-green transition-colors break-all"
          >
            View on Solscan →
          </a>
        </div>
      )}

      {error && <p className="text-xs text-red mt-2">{error}</p>}
    </motion.div>
  );
}
