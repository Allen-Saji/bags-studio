'use client';

import { ConvictionTier } from '@/lib/types';
import { TIER_COLORS } from '@/lib/constants';

interface TierBadgeProps {
  tier: ConvictionTier;
  size?: 'sm' | 'md' | 'lg';
}

export default function TierBadge({ tier, size = 'md' }: TierBadgeProps) {
  const color = TIER_COLORS[tier];

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2 py-0.5',
    lg: 'text-sm px-3 py-1',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold font-mono uppercase tracking-wider ${sizeClasses[size]}`}
      style={{
        color,
        backgroundColor: `${color}15`,
        border: `1px solid ${color}30`,
      }}
    >
      {tier === 'Champion' && '👑'}
      {tier === 'Catalyst' && '⚡'}
      {tier === 'Loyal' && '💎'}
      {tier === 'Active' && '🔥'}
      {tier === 'OG' && '🏷️'}
      {tier}
    </span>
  );
}
