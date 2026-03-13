'use client';

interface StreakBadgeProps {
  streak: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function StreakBadge({ streak, size = 'md' }: StreakBadgeProps) {
  if (streak <= 0) return null;

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const intensity = streak >= 30 ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
    streak >= 7 ? 'bg-orange-400/15 text-orange-300 border-orange-400/25' :
    'bg-orange-300/10 text-orange-200 border-orange-300/20';

  return (
    <span className={`inline-flex items-center gap-1 font-mono rounded-full border ${sizes[size]} ${intensity}`}>
      <span>&#x1F525;</span>
      {streak}d
    </span>
  );
}
