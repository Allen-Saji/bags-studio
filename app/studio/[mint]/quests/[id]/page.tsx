'use client';

import { use, useState, useCallback } from 'react';
import useSWR from 'swr';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import SubmissionReview from '@/components/studio/SubmissionReview';
import { Quest } from '@/lib/types';

const fetcher = (url: string) => fetch(url).then(r => {
  if (!r.ok) throw new Error(`${r.status}`);
  return r.json();
});

export default function QuestDetailPage({
  params,
}: {
  params: Promise<{ mint: string; id: string }>;
}) {
  const { mint, id } = use(params);
  const { publicKey } = useWallet();
  const wallet = publicKey?.toBase58();

  const [submitting, setSubmitting] = useState(false);
  const [proofUrl, setProofUrl] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { data: questData, isLoading, error: fetchError, mutate } = useSWR(
    `/api/engage/${mint}/quests/${id}`,
    fetcher,
  );

  const { data: dashData } = useSWR(`/api/dashboard/${mint}`, fetcher, {
    revalidateOnFocus: false,
  });

  const quest: Quest | null = questData?.quest || null;
  const submissions = questData?.submissions || [];
  const completions = questData?.completions || [];

  const creator = dashData?.creators?.find((c: { isCreator: boolean }) => c.isCreator);
  const isCreator = wallet && creator?.wallet === wallet;
  const hasCompleted = wallet && completions.some((c: { wallet: string }) => c.wallet === wallet);
  const isApprovalType = quest?.requires_approval;
  const isAutoVerifiable = quest && !quest.requires_approval;

  const handleSubmit = useCallback(async () => {
    if (!wallet) return;
    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch(`/api/engage/${mint}/quests/${id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet, proof_url: proofUrl || null }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Submission failed');
      }

      setMessage('Submission sent! Awaiting review.');
      setProofUrl('');
      mutate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setSubmitting(false);
    }
  }, [wallet, mint, id, proofUrl, mutate]);

  const handleCheckCompletion = useCallback(async () => {
    if (!wallet) return;
    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch(`/api/engage/${mint}/quests/${id}/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Check failed');

      if (data.completed) {
        setMessage(`Quest completed! +${quest?.points_reward || 0} points`);
      } else {
        setMessage(data.message || 'Not yet complete. Keep going!');
      }
      mutate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setSubmitting(false);
    }
  }, [wallet, mint, id, quest, mutate]);

  if (fetchError) {
    return (
      <div className="max-w-md mx-auto pt-12 text-center">
        <div className="text-red text-lg mb-2">Quest not found</div>
        <Link href={`/studio/${mint}/quests`} className="text-green hover:underline text-sm">
          ← Back to quests
        </Link>
      </div>
    );
  }

  if (isLoading || !quest) {
    return (
      <div className="flex items-center justify-center pt-24">
        <div className="w-6 h-6 border-2 border-green/30 border-t-green rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <Link
        href={`/studio/${mint}/quests`}
        className="text-xs text-gray-500 hover:text-green transition-colors mb-4 inline-block"
      >
        ← All quests
      </Link>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="rounded-xl border border-border-subtle p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-xl font-display font-bold">{quest.title}</h1>
              {quest.description && (
                <p className="text-sm text-gray-400 mt-2">{quest.description}</p>
              )}
            </div>
            <div className="text-right shrink-0 ml-4">
              <div className="text-lg font-mono font-bold text-green">+{quest.points_reward}</div>
              <div className="text-[10px] text-gray-500">points</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-[10px]">
            <span className="px-2 py-0.5 rounded-full bg-surface-2 border border-border-subtle text-gray-400 font-mono">
              {quest.quest_type}
            </span>
            {quest.requires_approval && (
              <span className="px-2 py-0.5 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 font-mono">
                Requires Approval
              </span>
            )}
            {quest.expires_at && (
              <span className="px-2 py-0.5 rounded-full bg-surface-2 border border-border-subtle text-gray-500">
                Expires {new Date(quest.expires_at).toLocaleDateString()}
              </span>
            )}
            {quest.max_completions && (
              <span className="px-2 py-0.5 rounded-full bg-surface-2 border border-border-subtle text-gray-500">
                {completions.length}/{quest.max_completions} completed
              </span>
            )}
          </div>
        </div>

        {/* Creator: submission review */}
        {isCreator && isApprovalType && (
          <div className="mb-6">
            <SubmissionReview
              submissions={submissions}
              mint={mint}
              creatorWallet={wallet!}
              onReviewed={() => mutate()}
            />
          </div>
        )}

        {/* Supporter actions */}
        {wallet && !isCreator && !hasCompleted && (
          <div className="rounded-xl border border-border-subtle p-5 space-y-4">
            {isAutoVerifiable && (
              <button
                onClick={handleCheckCompletion}
                disabled={submitting}
                className="w-full py-3 rounded-lg bg-green text-black text-sm font-semibold hover:bg-green-dark transition-colors disabled:opacity-50"
              >
                {submitting ? 'Checking...' : 'Check Completion'}
              </button>
            )}

            {isApprovalType && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Proof URL (optional)
                  </label>
                  <input
                    type="text"
                    value={proofUrl}
                    onChange={e => setProofUrl(e.target.value)}
                    placeholder="https://twitter.com/..."
                    className="w-full px-4 py-2.5 rounded-lg bg-surface-2 border border-border-subtle text-white text-sm font-mono placeholder:text-gray-600 focus:outline-none focus:border-green/50 transition-colors"
                  />
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full py-3 rounded-lg bg-green text-black text-sm font-semibold hover:bg-green-dark transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit for Review'}
                </button>
              </div>
            )}

            {error && <p className="text-xs text-red">{error}</p>}
            {message && <p className="text-xs text-green">{message}</p>}
          </div>
        )}

        {hasCompleted && (
          <div className="rounded-xl border border-green/20 bg-green/5 p-5 text-center">
            <p className="text-sm text-green font-semibold">Quest Completed</p>
            <p className="text-xs text-gray-400 mt-1">
              You earned {quest.points_reward} points from this quest.
            </p>
          </div>
        )}

        {!wallet && (
          <div className="rounded-xl border border-border-subtle p-5 text-center">
            <p className="text-sm text-gray-500">Connect your wallet to participate in this quest.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
