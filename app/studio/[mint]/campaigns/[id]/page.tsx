'use client';

import { use, useState } from 'react';
import useSWR, { mutate } from 'swr';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import EligibilityTable from '@/components/studio/EligibilityTable';
import { Campaign, CampaignStatus } from '@/lib/types';

const fetcher = (url: string) => fetch(url).then(r => {
  if (!r.ok) throw new Error(`${r.status}`);
  return r.json();
});

const STATUS_ACTIONS: Record<string, { label: string; next: CampaignStatus; style: string }[]> = {
  draft: [
    { label: 'Activate', next: 'active', style: 'bg-green text-black hover:bg-green-dark' },
    { label: 'Cancel', next: 'cancelled', style: 'bg-surface-2 text-gray-400 border border-border-subtle hover:text-red hover:border-red/30' },
  ],
  active: [
    { label: 'Complete', next: 'completed', style: 'bg-green text-black hover:bg-green-dark' },
    { label: 'Cancel', next: 'cancelled', style: 'bg-surface-2 text-gray-400 border border-border-subtle hover:text-red hover:border-red/30' },
  ],
  completed: [],
  cancelled: [],
};

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-gray-600/20 text-gray-400',
  active: 'bg-green/10 text-green',
  completed: 'bg-blue-500/10 text-blue-400',
  cancelled: 'bg-red/10 text-red',
};

export default function CampaignDetailPage({
  params,
}: {
  params: Promise<{ mint: string; id: string }>;
}) {
  const { mint, id } = use(params);
  const { publicKey } = useWallet();
  const [transitioning, setTransitioning] = useState(false);
  const [actionError, setActionError] = useState('');

  const { data: campaign, error: campaignError, isLoading: campaignLoading } = useSWR<Campaign>(
    `/api/campaigns/${id}`,
    fetcher
  );

  const { data: scoreData, isLoading: scoresLoading, error: scoresError } = useSWR(
    `/api/score/${mint}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  const handleStatusChange = async (newStatus: CampaignStatus) => {
    if (!publicKey) return;

    setTransitioning(true);
    setActionError('');

    try {
      const res = await fetch(`/api/campaigns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          creator_wallet: publicKey.toBase58(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update campaign');
      }

      // Revalidate campaign data
      mutate(`/api/campaigns/${id}`);
      mutate(`/api/campaigns?mint=${mint}`);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setTransitioning(false);
    }
  };

  // Error states
  if (campaignError) {
    return (
      <div className="text-center pt-12">
        <p className="text-red mb-2">Failed to load campaign</p>
        <p className="text-gray-500 text-sm mb-4">
          {campaignError.message || 'The campaign could not be found or there was a network error.'}
        </p>
        <Link href={`/studio/${mint}/campaigns`} className="text-green hover:underline text-sm">
          ← Back to campaigns
        </Link>
      </div>
    );
  }

  if (campaignLoading || !campaign) {
    return (
      <div className="flex justify-center pt-12">
        <div className="w-6 h-6 border-2 border-green/30 border-t-green rounded-full animate-spin" />
      </div>
    );
  }

  const actions = STATUS_ACTIONS[campaign.status] || [];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href={`/studio/${mint}/campaigns`}
          className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
        >
          ← Campaigns
        </Link>
      </div>

      {/* Campaign header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-display font-bold">{campaign.name}</h1>
          <span className={`text-xs font-mono px-2 py-1 rounded-full ${STATUS_STYLES[campaign.status] || STATUS_STYLES.draft}`}>
            {campaign.status}
          </span>
        </div>
        {campaign.description && (
          <p className="text-gray-400 text-sm">{campaign.description}</p>
        )}
        <div className="flex gap-4 mt-3 text-xs text-gray-500 font-mono">
          <span>Type: {campaign.type}</span>
          <span>Min tier: {campaign.tier_threshold}</span>
          {campaign.max_wallets && <span>Cap: {campaign.max_wallets}</span>}
        </div>

        {/* Status actions */}
        {actions.length > 0 && publicKey && (
          <div className="flex items-center gap-3 mt-5">
            {actions.map(action => (
              <button
                key={action.next}
                onClick={() => handleStatusChange(action.next)}
                disabled={transitioning}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${action.style}`}
              >
                {transitioning ? 'Updating...' : action.label}
              </button>
            ))}
          </div>
        )}

        {actionError && (
          <p className="text-sm text-red mt-3">{actionError}</p>
        )}

        {/* Share link */}
        <div className="mt-4 p-3 rounded-lg bg-surface-2 border border-border-subtle">
          <div className="text-xs text-gray-500 mb-1">Public supporter link:</div>
          <div className="flex items-center gap-2">
            <code className="text-xs text-green font-mono flex-1 truncate">
              {typeof window !== 'undefined' ? window.location.origin : ''}/campaign/{campaign.id}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/campaign/${campaign.id}`
                );
              }}
              className="px-2 py-1 text-xs font-mono rounded bg-surface border border-border-subtle text-gray-400 hover:text-green transition-colors"
            >
              Copy
            </button>
          </div>
        </div>

        {/* Server-side CSV export (for active/completed campaigns with snapshotted data) */}
        {(campaign.status === 'active' || campaign.status === 'completed') && (
          <div className="mt-3">
            <a
              href={`/api/campaigns/${campaign.id}/export`}
              download
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-mono rounded-lg bg-surface-2 border border-border-subtle text-gray-400 hover:text-green hover:border-green/30 transition-colors"
            >
              Download Eligible Wallets CSV
            </a>
          </div>
        )}
      </div>

      {/* Eligibility table */}
      {scoresError ? (
        <div className="rounded-xl border border-red/20 bg-red/5 p-8 text-center">
          <p className="text-red text-sm mb-1">Failed to load scores</p>
          <p className="text-gray-500 text-xs">Check that the Bags API is reachable and the mint address is valid.</p>
        </div>
      ) : scoresLoading ? (
        <div className="flex justify-center pt-8">
          <div className="text-center">
            <div className="w-6 h-6 border-2 border-green/30 border-t-green rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500">Loading scores...</p>
          </div>
        </div>
      ) : scoreData?.scores?.length > 0 ? (
        <EligibilityTable scores={scoreData.scores} campaign={campaign} />
      ) : (
        <div className="rounded-xl border border-border-subtle p-8 text-center">
          <p className="text-gray-500 text-sm mb-1">No supporters found</p>
          <p className="text-gray-600 text-xs">No claim events have been recorded for this token yet.</p>
        </div>
      )}
    </div>
  );
}
