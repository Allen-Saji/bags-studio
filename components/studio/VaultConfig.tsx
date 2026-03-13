'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { RewardVault } from '@/lib/types';

interface VaultConfigProps {
  vault: RewardVault | null;
  mint: string;
  creatorWallet: string;
  onSetup?: () => void;
}

export default function VaultConfig({ vault, mint, creatorWallet, onSetup }: VaultConfigProps) {
  const [vaultWallet, setVaultWallet] = useState(vault?.vault_wallet || '');
  const [feeShareBps, setFeeShareBps] = useState(String(vault?.fee_share_bps || 2500));
  const [fundingSource, setFundingSource] = useState<string>(vault?.funding_source || 'direct');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!vaultWallet) {
      setError('Vault wallet is required');
      return;
    }
    setSaving(true);
    setError('');

    try {
      const res = await fetch(`/api/engage/${mint}/vault/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vault_wallet: vaultWallet,
          fee_share_bps: parseInt(feeShareBps),
          funding_source: fundingSource,
          creator_wallet: creatorWallet,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Setup failed');
      }

      onSetup?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Setup failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border-subtle p-5"
    >
      <h3 className="text-sm font-display font-bold mb-4">Reward Vault</h3>

      {vault && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 rounded-lg bg-surface-2">
            <div className="text-[10px] text-gray-500 uppercase">Total Distributed</div>
            <div className="text-sm font-mono font-bold text-white">
              {(Number(vault.total_distributed) / 1e9).toFixed(4)} SOL
            </div>
          </div>
          <div className="p-3 rounded-lg bg-surface-2">
            <div className="text-[10px] text-gray-500 uppercase">Total Claimed</div>
            <div className="text-sm font-mono font-bold text-green">
              {(Number(vault.total_claimed) / 1e9).toFixed(4)} SOL
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Vault Wallet</label>
          <input
            type="text"
            value={vaultWallet}
            onChange={e => setVaultWallet(e.target.value)}
            placeholder="Solana wallet address"
            className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border-subtle text-sm font-mono text-white placeholder:text-gray-600 focus:outline-none focus:border-green/50 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Fee Share (bps)</label>
          <input
            type="number"
            value={feeShareBps}
            onChange={e => setFeeShareBps(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border-subtle text-sm font-mono text-white focus:outline-none focus:border-green/50 transition-colors"
          />
          <p className="text-[10px] text-gray-600 mt-1">
            {(parseInt(feeShareBps) / 100).toFixed(1)}% of trading fees
          </p>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Funding Source</label>
          <div className="flex gap-2">
            {['direct', 'partner', 'bags_amm'].map(src => (
              <button
                key={src}
                type="button"
                onClick={() => setFundingSource(src)}
                className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-colors ${
                  fundingSource === src
                    ? 'bg-green/20 text-green border border-green/30'
                    : 'bg-surface-2 text-gray-400 border border-border-subtle hover:border-green/20'
                }`}
              >
                {src === 'bags_amm' ? 'BagsAMM' : src.charAt(0).toUpperCase() + src.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-xs text-red">{error}</p>}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-2 rounded-lg bg-green text-black text-sm font-semibold hover:bg-green-dark transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : vault ? 'Update Vault' : 'Setup Vault'}
        </button>
      </div>
    </motion.div>
  );
}
