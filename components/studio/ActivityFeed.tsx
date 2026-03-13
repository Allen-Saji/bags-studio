'use client';

import { motion } from 'framer-motion';
import useSWR from 'swr';
import { FEED_EVENT_LABELS } from '@/lib/constants';

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface FeedEvent {
  id: string;
  wallet: string;
  event_type: string;
  title: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

const EVENT_ICONS: Record<string, string> = {
  quest_complete: '\u2705',
  referral_verified: '\uD83E\uDD1D',
  streak_milestone: '\uD83D\uDD25',
  tier_up: '\u2B06\uFE0F',
  reward_claimed: '\uD83D\uDCB0',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function ActivityFeed({ mint }: { mint: string }) {
  const { data } = useSWR(`/api/engage/${mint}/feed?limit=20`, fetcher, {
    refreshInterval: 30000,
  });

  const events: FeedEvent[] = data?.events || [];

  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-border-subtle p-5">
        <h3 className="text-sm font-display font-bold mb-3">Activity Feed</h3>
        <p className="text-xs text-gray-500 text-center py-4">No activity yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border-subtle p-5">
      <h3 className="text-sm font-display font-bold mb-3">Activity Feed</h3>
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {events.map((event, i) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className="flex items-start gap-3 py-2 border-b border-border-subtle last:border-0"
          >
            <span className="text-sm mt-0.5">
              {EVENT_ICONS[event.event_type] || '\u26A1'}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-gray-400">
                  {event.wallet.slice(0, 4)}...{event.wallet.slice(-4)}
                </span>
                <span className="text-[10px] text-gray-600">{timeAgo(event.created_at)}</span>
              </div>
              <p className="text-xs text-gray-300 mt-0.5">{event.title}</p>
            </div>
            <span className="text-[10px] text-gray-600 font-mono shrink-0">
              {FEED_EVENT_LABELS[event.event_type] || event.event_type}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
