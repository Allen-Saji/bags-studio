'use client';

import { motion } from 'framer-motion';
import { EngagementLeaderboardEntry, HoldingStreak } from '@/lib/types';

interface PointsBreakdownProps {
  points: EngagementLeaderboardEntry;
  streak: HoldingStreak | null;
}

export default function PointsBreakdown({ points, streak }: PointsBreakdownProps) {
  const sources = [
    { label: 'Hold', value: points.hold_points, color: 'bg-blue-400' },
    { label: 'Quest', value: points.quest_points, color: 'bg-purple-400' },
    { label: 'Referral', value: points.referral_points, color: 'bg-yellow-400' },
    { label: 'Streak', value: points.streak_points, color: 'bg-green' },
  ];

  const total = points.total_points || 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border-subtle p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-display font-bold">Your Points</h3>
        <div className="text-lg font-mono font-bold text-green">
          {Math.round(points.total_points).toLocaleString()}
        </div>
      </div>

      {/* Points bar */}
      <div className="h-2 rounded-full bg-surface-2 overflow-hidden flex mb-4">
        {sources.map(s => {
          const pct = (s.value / total) * 100;
          if (pct < 1) return null;
          return (
            <div
              key={s.label}
              className={`${s.color} h-full`}
              style={{ width: `${pct}%` }}
            />
          );
        })}
      </div>

      {/* Source breakdown */}
      <div className="grid grid-cols-2 gap-2">
        {sources.map(s => (
          <div key={s.label} className="flex items-center gap-2 text-xs">
            <div className={`w-2 h-2 rounded-full ${s.color}`} />
            <span className="text-gray-400">{s.label}</span>
            <span className="font-mono text-white ml-auto">{Math.round(s.value)}</span>
          </div>
        ))}
      </div>

      {/* Streak */}
      {streak && streak.current_streak > 0 && (
        <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-orange-400">&#x1F525;</span>
            <span className="text-xs text-gray-400">Holding Streak</span>
          </div>
          <span className="text-sm font-mono font-bold text-orange-400">
            {streak.current_streak} days
          </span>
        </div>
      )}

      {points.rank > 0 && (
        <div className="mt-2 text-xs text-gray-500 text-center font-mono">
          Rank #{points.rank}
        </div>
      )}
    </motion.div>
  );
}
