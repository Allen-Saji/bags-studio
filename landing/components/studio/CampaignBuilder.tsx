'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ConvictionTier, CampaignType } from '@/lib/types';
import { TIER_ORDER, CAMPAIGN_TYPES } from '@/lib/constants';

interface CampaignBuilderProps {
  mint: string;
  creatorWallet: string;
}

export default function CampaignBuilder({ mint, creatorWallet }: CampaignBuilderProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [type, setType] = useState<CampaignType>('airdrop');
  const [tierThreshold, setTierThreshold] = useState<ConvictionTier>('Active');
  const [maxWallets, setMaxWallets] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Campaign name is required');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mint_address: mint,
          creator_wallet: creatorWallet,
          name: name.trim(),
          type,
          tier_threshold: tierThreshold,
          max_wallets: maxWallets ? parseInt(maxWallets) : null,
          description: description.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create campaign');
      }

      const campaign = await res.json();
      router.push(`/studio/${mint}/campaigns/${campaign.id}`);
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
      <h2 className="text-xl font-display font-bold mb-6">Create Campaign</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Campaign Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g., Diamond Hands Airdrop"
            className="w-full px-4 py-2.5 rounded-lg bg-surface-2 border border-border-subtle text-white placeholder:text-gray-600 focus:outline-none focus:border-green/50 transition-colors"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Description (optional)</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="What's this campaign about?"
            rows={3}
            className="w-full px-4 py-2.5 rounded-lg bg-surface-2 border border-border-subtle text-white placeholder:text-gray-600 focus:outline-none focus:border-green/50 transition-colors resize-none"
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Campaign Type</label>
          <div className="grid grid-cols-2 gap-2">
            {CAMPAIGN_TYPES.map(ct => (
              <button
                key={ct.value}
                type="button"
                onClick={() => setType(ct.value as CampaignType)}
                className={`px-4 py-2.5 rounded-lg text-sm font-mono transition-colors ${
                  type === ct.value
                    ? 'bg-green/20 text-green border border-green/30'
                    : 'bg-surface-2 text-gray-400 border border-border-subtle hover:border-green/20'
                }`}
              >
                {ct.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tier threshold */}
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Minimum Tier</label>
          <div className="flex gap-2 flex-wrap">
            {TIER_ORDER.map(tier => (
              <button
                key={tier}
                type="button"
                onClick={() => setTierThreshold(tier)}
                className={`px-3 py-1.5 text-xs rounded-full font-mono transition-colors ${
                  tierThreshold === tier
                    ? 'bg-green/20 text-green border border-green/30'
                    : 'bg-surface-2 text-gray-400 border border-border-subtle hover:border-green/20'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>

        {/* Max wallets */}
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">
            Max Wallets <span className="text-gray-600">(optional)</span>
          </label>
          <input
            type="number"
            value={maxWallets}
            onChange={e => setMaxWallets(e.target.value)}
            placeholder="Leave empty for unlimited"
            className="w-full px-4 py-2.5 rounded-lg bg-surface-2 border border-border-subtle text-white placeholder:text-gray-600 focus:outline-none focus:border-green/50 transition-colors"
          />
        </div>

        {error && <p className="text-sm text-red">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-lg bg-green text-black font-semibold text-sm hover:bg-green-dark transition-colors disabled:opacity-50"
        >
          {submitting ? 'Creating...' : 'Create Campaign'}
        </button>
      </form>
    </motion.div>
  );
}
