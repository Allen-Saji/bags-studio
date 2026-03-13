'use client';

import { use } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Campaign } from '@/lib/types';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function CampaignsPage({
  params,
}: {
  params: Promise<{ mint: string }>;
}) {
  const { mint } = use(params);

  const { data: campaigns, isLoading, error } = useSWR<Campaign[]>(
    `/api/campaigns?mint=${mint}`,
    fetcher
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href={`/studio/${mint}`}
            className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
          >
            ← Dashboard
          </Link>
          <h1 className="text-xl font-display font-bold">Campaigns</h1>
        </div>
        <Link
          href={`/studio/${mint}/campaigns/new`}
          className="px-4 py-2 rounded-lg bg-green text-black font-semibold text-sm hover:bg-green-dark transition-colors"
        >
          New Campaign
        </Link>
      </div>

      {error ? (
        <div className="text-center pt-12">
          <p className="text-red text-sm mb-2">Failed to load campaigns</p>
          <p className="text-gray-500 text-xs">Check your connection and try again.</p>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center pt-12">
          <div className="w-6 h-6 border-2 border-green/30 border-t-green rounded-full animate-spin" />
        </div>
      ) : campaigns && campaigns.length > 0 ? (
        <div className="space-y-3">
          {campaigns.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={`/studio/${mint}/campaigns/${c.id}`}
                className="block p-5 rounded-xl bg-surface-2 border border-border-subtle hover:border-green/30 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold group-hover:text-green transition-colors">
                      {c.name}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span className="font-mono uppercase">{c.type}</span>
                      <span>Min tier: {c.tier_threshold}</span>
                      {c.max_wallets && <span>Cap: {c.max_wallets}</span>}
                    </div>
                  </div>
                  <span
                    className={`text-xs font-mono px-2 py-1 rounded-full ${
                      c.status === 'active'
                        ? 'bg-green/10 text-green'
                        : c.status === 'draft'
                        ? 'bg-gray-600/20 text-gray-400'
                        : 'bg-surface text-gray-500'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center pt-12">
          <p className="text-gray-500 mb-4">No campaigns yet</p>
          <Link
            href={`/studio/${mint}/campaigns/new`}
            className="text-green hover:underline text-sm"
          >
            Create your first campaign
          </Link>
        </div>
      )}
    </div>
  );
}
