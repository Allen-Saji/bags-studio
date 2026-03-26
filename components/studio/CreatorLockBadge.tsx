'use client';

import { motion } from 'framer-motion';
import useSWR from 'swr';
import { TokenLockRecord } from '@/lib/types';

const fetcher = (url: string) => fetch(url).then(r => r.json());

function timeRemaining(lockEnd: string): string {
  const end = new Date(lockEnd).getTime();
  const now = Date.now();
  const diff = end - now;

  if (diff <= 0) return 'Unlocked';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 365) return `${Math.floor(days / 365)}y ${days % 365}d`;
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h`;
}

function formatAmount(amount: number, decimals = 9): string {
  const val = amount / Math.pow(10, decimals);
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(1)}K`;
  return val.toFixed(0);
}

export default function CreatorLockBadge({ mint }: { mint: string }) {
  const { data } = useSWR(`/api/engage/${mint}/locks`, fetcher, {
    revalidateOnFocus: false,
  });

  const locks: TokenLockRecord[] = data?.locks || [];
  const activeLocks = locks.filter(l => !l.released);

  if (activeLocks.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-green/20 bg-green/5 p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00E676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <span className="text-sm font-display font-bold text-green">Creator Tokens Locked</span>
      </div>

      <div className="space-y-2">
        {activeLocks.map((lock, i) => {
          const isExpired = new Date(lock.lock_end).getTime() <= Date.now();

          return (
            <div
              key={lock.id || i}
              className="flex items-center justify-between p-3 rounded-lg bg-surface border border-border-subtle"
            >
              <div>
                <div className="text-sm font-mono font-bold text-white">
                  {formatAmount(lock.amount)} tokens
                </div>
                <div className="text-[10px] text-gray-500 font-mono">
                  Locked {new Date(lock.lock_start).toLocaleDateString()} → {new Date(lock.lock_end).toLocaleDateString()}
                </div>
              </div>
              <div className="text-right">
                {isExpired ? (
                  <span className="text-[10px] font-mono px-2 py-1 rounded bg-gray-800 text-gray-400">
                    Unlockable
                  </span>
                ) : (
                  <div>
                    <div className="text-xs font-mono font-bold text-green">
                      {timeRemaining(lock.lock_end)}
                    </div>
                    <div className="text-[10px] text-gray-500">remaining</div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
