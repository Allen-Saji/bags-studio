'use client';

import { use, useState, useCallback } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import SubmissionReview from '@/components/studio/SubmissionReview';
import { Quest } from '@/lib/types';
import { QUEST_TYPES } from '@/lib/constants';
import { useTokenRole } from '@/lib/use-token-role';

const fetcher = (url: string) => fetch(url).then(r => {
  if (!r.ok) throw new Error(`${r.status}`);
  return r.json();
});

const INDEX_TO_TIER: Record<number, string> = {
  1: 'OG', 2: 'Active', 3: 'Loyal', 4: 'Catalyst', 5: 'Champion',
};

function questTypeLabel(type: string): string {
  return QUEST_TYPES.find(qt => qt.value === type)?.label || type;
}

function formatProgress(quest: Quest, currentValue: number, targetValue: number): string {
  switch (quest.quest_type) {
    case 'hold_duration':
    case 'streak':
      return `${currentValue}/${targetValue} days`;
    case 'claim_count':
      return `${currentValue}/${targetValue} claims`;
    case 'referral_count':
      return `${currentValue}/${targetValue} referrals`;
    case 'token_balance':
      return `${currentValue.toLocaleString()}/${targetValue.toLocaleString()} tokens`;
    case 'trade_volume':
      return `${currentValue.toLocaleString()}/${targetValue.toLocaleString()} volume`;
    case 'tier_reached':
      return `${INDEX_TO_TIER[currentValue] || 'None'} → ${INDEX_TO_TIER[targetValue] || 'Unknown'}`;
    case 'meta':
      return `${currentValue}/${targetValue} quests completed`;
    default:
      return `${currentValue}/${targetValue}`;
  }
}

export default function QuestDetailPage({
  params,
}: {
  params: Promise<{ mint: string; id: string }>;
}) {
  const { mint, id } = use(params);
  const router = useRouter();
  const { isCreator, wallet, role } = useTokenRole(mint);

  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [proofUrl, setProofUrl] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [checkResult, setCheckResult] = useState<{ current_value: number; target_value: number } | null>(null);

  const { data: questData, isLoading, error: fetchError, mutate } = useSWR(
    wallet ? `/api/engage/${mint}/quests/${id}?wallet=${wallet}` : `/api/engage/${mint}/quests/${id}`,
    fetcher,
  );

  const quest: Quest | null = questData?.quest || null;
  const submissions = questData?.submissions || [];
  const completed = questData?.completed || false;
  const completionCount = questData?.completionCount || 0;
  const progress = questData?.progress || null;

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
        body: JSON.stringify({ proof_url: proofUrl || null }),
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
        body: JSON.stringify({}),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Check failed');

      setCheckResult({ current_value: data.current_value, target_value: data.target_value });

      if (data.completed) {
        setMessage(`Quest completed! +${quest?.points_reward || 0} points`);
      } else {
        setMessage('Not yet complete. Keep going!');
      }
      mutate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setSubmitting(false);
    }
  }, [wallet, mint, id, quest, mutate]);

  const handleDelete = useCallback(async () => {
    if (!confirm('Delete this quest? Existing completions will be kept.')) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/engage/${mint}/quests/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete');
      }
      router.push(`/studio/${mint}/quests`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
      setDeleting(false);
    }
  }, [mint, id, router]);

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

  const displayProgress = checkResult || progress;
  const isSignedIn = role !== 'visitor' && role !== 'loading';

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
              {questTypeLabel(quest.quest_type)}
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
                {completionCount}/{quest.max_completions} completed
              </span>
            )}
          </div>

          {displayProgress && displayProgress.current_value >= 0 && !completed && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-gray-400">Progress</span>
                <span className="font-mono text-gray-300">
                  {formatProgress(quest, displayProgress.current_value, displayProgress.target_value)}
                </span>
              </div>
              <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
                <div
                  className="h-full rounded-full bg-green transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.round((displayProgress.current_value / displayProgress.target_value) * 100))}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Creator: delete quest */}
        {isCreator && (
          <div className="mb-6 flex justify-end">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 text-xs font-mono hover:bg-red-500/10 transition-colors disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Delete Quest'}
            </button>
          </div>
        )}

        {/* Creator: submission review */}
        {isCreator && isApprovalType && (
          <div className="mb-6">
            <SubmissionReview
              submissions={submissions}
              mint={mint}
              creatorWallet={wallet || ''}
              onReviewed={() => mutate()}
            />
          </div>
        )}

        {/* Supporter actions */}
        {isSignedIn && !isCreator && !completed && (
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

        {completed && (
          <div className="rounded-xl border border-green/20 bg-green/5 p-5 text-center">
            <p className="text-sm text-green font-semibold">Quest Completed</p>
            <p className="text-xs text-gray-400 mt-1">
              You earned {quest.points_reward} points from this quest.
            </p>
          </div>
        )}

        {!isSignedIn && (
          <div className="rounded-xl border border-border-subtle p-5 text-center">
            <p className="text-sm text-gray-500">Sign in to participate in this quest.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
