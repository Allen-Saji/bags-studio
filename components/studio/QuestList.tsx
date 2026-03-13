'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion } from 'framer-motion';
import useSWR from 'swr';
import Link from 'next/link';
import { Quest } from '@/lib/types';
import { QUEST_TYPES } from '@/lib/constants';

const fetcher = (url: string) => fetch(url).then(r => r.json());

const questTypeLabel = (type: string) =>
  QUEST_TYPES.find(t => t.value === type)?.label || type;

export default function QuestList({ mint }: { mint: string }) {
  const { publicKey } = useWallet();
  const { data, isLoading } = useSWR(`/api/engage/${mint}/quests`, fetcher);

  const quests: Quest[] = data?.quests || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-5 h-5 border-2 border-green/30 border-t-green rounded-full animate-spin" />
      </div>
    );
  }

  if (quests.length === 0) {
    return (
      <div className="rounded-xl border border-border-subtle p-8 text-center">
        <p className="text-gray-500 text-sm mb-2">No active quests</p>
        <p className="text-gray-600 text-xs">Check back later for new quests to complete.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {quests.map((quest, i) => (
        <motion.div
          key={quest.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <Link
            href={`/studio/${mint}/quests/${quest.id}`}
            className="block rounded-xl border border-border-subtle p-4 hover:border-green/20 hover:bg-surface-2/50 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-white">{quest.title}</h4>
                {quest.description && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{quest.description}</p>
                )}
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] font-mono text-gray-500 px-2 py-0.5 rounded-full bg-surface-2 border border-border-subtle">
                    {questTypeLabel(quest.quest_type)}
                  </span>
                  {quest.expires_at && (
                    <span className="text-[10px] text-gray-600">
                      Expires {new Date(quest.expires_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right ml-4">
                <div className="text-sm font-mono font-bold text-green">
                  +{quest.points_reward}
                </div>
                <div className="text-[10px] text-gray-500">pts</div>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
