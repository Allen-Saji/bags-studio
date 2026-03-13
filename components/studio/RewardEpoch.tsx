'use client';

import { motion } from 'framer-motion';
import { RewardEpoch as RewardEpochType } from '@/lib/types';

interface RewardEpochProps {
  epochs: RewardEpochType[];
}

export default function RewardEpoch({ epochs }: RewardEpochProps) {
  if (epochs.length === 0) {
    return (
      <div className="text-xs text-gray-500 py-4 text-center">No reward epochs yet.</div>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-3">
        Distribution History
      </h4>
      {epochs.map((epoch, i) => (
        <motion.div
          key={epoch.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-center justify-between p-3 rounded-lg bg-surface-2 border border-border-subtle"
        >
          <div>
            <span className="text-xs font-mono text-gray-300">Epoch #{epoch.epoch_number}</span>
            <div className="text-[10px] text-gray-600 mt-0.5">
              {new Date(epoch.created_at).toLocaleDateString()} · {epoch.eligible_wallets} wallets
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-mono font-bold text-white">
              {(Number(epoch.vault_balance) / 1e9).toFixed(4)} SOL
            </div>
            <div className="text-[10px] text-gray-500">
              {(Number(epoch.distributed) / 1e9).toFixed(4)} claimed
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
