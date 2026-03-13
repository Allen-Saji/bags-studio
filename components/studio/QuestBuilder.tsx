'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { QUEST_TYPES } from '@/lib/constants';

interface QuestBuilderProps {
  mint: string;
  creatorWallet: string;
}

export default function QuestBuilder({ mint, creatorWallet }: QuestBuilderProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questType, setQuestType] = useState('hold_duration');
  const [pointsReward, setPointsReward] = useState('50');
  const [targetValue, setTargetValue] = useState('1');
  const [maxCompletions, setMaxCompletions] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const requiresApproval = questType === 'social_share' || questType === 'custom';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Quest title is required');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`/api/engage/${mint}/quests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creator_wallet: creatorWallet,
          title: title.trim(),
          description: description.trim() || null,
          quest_type: questType,
          points_reward: parseInt(pointsReward) || 50,
          target_value: parseInt(targetValue) || 1,
          requires_approval: requiresApproval,
          max_completions: maxCompletions ? parseInt(maxCompletions) : null,
          expires_at: expiresAt || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create quest');
      }

      const quest = await res.json();
      router.push(`/studio/${mint}/quests/${quest.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-xl"
    >
      <h2 className="text-xl font-display font-bold mb-6">Create Quest</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Quest Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g., Hold for 7 days"
            className="w-full px-4 py-2.5 rounded-lg bg-surface-2 border border-border-subtle text-white placeholder:text-gray-600 focus:outline-none focus:border-green/50 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Description (optional)</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="What do supporters need to do?"
            rows={3}
            className="w-full px-4 py-2.5 rounded-lg bg-surface-2 border border-border-subtle text-white placeholder:text-gray-600 focus:outline-none focus:border-green/50 transition-colors resize-none"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Quest Type</label>
          <div className="grid grid-cols-2 gap-2">
            {QUEST_TYPES.map(qt => (
              <button
                key={qt.value}
                type="button"
                onClick={() => setQuestType(qt.value)}
                className={`px-4 py-2.5 rounded-lg text-sm font-mono transition-colors ${
                  questType === qt.value
                    ? 'bg-green/20 text-green border border-green/30'
                    : 'bg-surface-2 text-gray-400 border border-border-subtle hover:border-green/20'
                }`}
              >
                {qt.label}
              </button>
            ))}
          </div>
          {requiresApproval && (
            <p className="text-[10px] text-yellow-400 mt-2">
              This quest type requires manual approval of submissions.
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Points Reward</label>
            <input
              type="number"
              value={pointsReward}
              onChange={e => setPointsReward(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-surface-2 border border-border-subtle text-white focus:outline-none focus:border-green/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Target Value</label>
            <input
              type="number"
              value={targetValue}
              onChange={e => setTargetValue(e.target.value)}
              placeholder="e.g., 7 (days)"
              className="w-full px-4 py-2.5 rounded-lg bg-surface-2 border border-border-subtle text-white placeholder:text-gray-600 focus:outline-none focus:border-green/50 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">
              Max Completions <span className="text-gray-600">(optional)</span>
            </label>
            <input
              type="number"
              value={maxCompletions}
              onChange={e => setMaxCompletions(e.target.value)}
              placeholder="Unlimited"
              className="w-full px-4 py-2.5 rounded-lg bg-surface-2 border border-border-subtle text-white placeholder:text-gray-600 focus:outline-none focus:border-green/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">
              Expires <span className="text-gray-600">(optional)</span>
            </label>
            <input
              type="date"
              value={expiresAt}
              onChange={e => setExpiresAt(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-surface-2 border border-border-subtle text-white focus:outline-none focus:border-green/50 transition-colors"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-lg bg-green text-black font-semibold text-sm hover:bg-green-dark transition-colors disabled:opacity-50"
        >
          {submitting ? 'Creating...' : 'Create Quest'}
        </button>
      </form>
    </motion.div>
  );
}
