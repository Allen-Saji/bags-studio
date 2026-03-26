'use client';

import { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { Transaction } from '@solana/web3.js';
import { motion } from 'framer-motion';
import { RewardVault } from '@/lib/types';

interface VaultConfigProps {
  vault: RewardVault | null;
  mint: string;
  creatorWallet: string;
  onSetup?: () => void;
}

export default function VaultConfig({ vault, mint, creatorWallet, onSetup }: VaultConfigProps) {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [creating, setCreating] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const [treasuryPDA, setTreasuryPDA] = useState(vault?.treasury_pda || '');

  const isOnChain = vault?.on_chain;

  const handleCreateVault = useCallback(async () => {
    if (!publicKey || !signTransaction) return;
    setCreating(true);
    setError('');

    try {
      const res = await fetch(`/api/engage/${mint}/rewards/initialize-vault`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create vault');
      }

      const { transaction, treasuryPDA: pda } = await res.json();

      // Sign and send
      const tx = Transaction.from(Buffer.from(transaction, 'base64'));
      const signed = await signTransaction(tx);
      const sig = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(sig, 'confirmed');

      setTreasuryPDA(pda);
      onSetup?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create vault');
    } finally {
      setCreating(false);
    }
  }, [publicKey, signTransaction, connection, mint, onSetup]);

  const handleVerify = useCallback(async () => {
    setVerifying(true);
    setError('');

    try {
      const res = await fetch(`/api/engage/${mint}/rewards/verify-fee-share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();
      setVerified(data.verified);
      if (!data.verified) {
        setError(data.message || 'Fee-share not configured yet');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setVerifying(false);
    }
  }, [mint]);

  const activeTreasuryPDA = treasuryPDA || vault?.treasury_pda || '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border-subtle p-5"
    >
      <h3 className="text-sm font-display font-bold mb-4">Reward Vault</h3>

      {/* Stats for existing vaults */}
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

      {/* Step 1: Create on-chain vault */}
      {!isOnChain && (
        <div className="space-y-3">
          <p className="text-xs text-gray-400">
            Create a trustless on-chain vault. Trade fees will accumulate in a program-owned PDA — no one can rug.
          </p>

          {!publicKey ? (
            <p className="text-xs text-yellow-500">Connect a wallet to create the vault on-chain.</p>
          ) : (
            <button
              onClick={handleCreateVault}
              disabled={creating}
              className="w-full py-2.5 rounded-lg bg-green text-black text-sm font-semibold hover:bg-green-dark transition-colors disabled:opacity-50"
            >
              {creating ? 'Creating vault...' : 'Create On-Chain Vault'}
            </button>
          )}
        </div>
      )}

      {/* Step 2: Configure fee-share on Bags */}
      {isOnChain && activeTreasuryPDA && !verified && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-green text-sm">1.</span>
            <span className="text-xs text-green font-medium">Vault created</span>
          </div>

          <div className="p-3 rounded-lg bg-surface-2 border border-border-subtle">
            <div className="text-[10px] text-gray-500 uppercase mb-1">Treasury PDA</div>
            <code className="text-[11px] font-mono text-green break-all">{activeTreasuryPDA}</code>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-yellow-400 text-sm">2.</span>
            <span className="text-xs text-yellow-400 font-medium">Add as fee-share recipient</span>
          </div>

          <p className="text-xs text-gray-400">
            Go to your token on bags.fm and add the Treasury PDA above as a fee-share recipient.
            Set the percentage of trade fees you want to distribute to your community.
          </p>

          <a
            href={`https://bags.fm/token/${mint}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center py-2.5 rounded-lg bg-surface-2 border border-border-subtle text-sm font-mono text-gray-300 hover:text-green hover:border-green/30 transition-colors"
          >
            Open on bags.fm →
          </a>

          <button
            onClick={handleVerify}
            disabled={verifying}
            className="w-full py-2.5 rounded-lg bg-green/20 text-green text-sm font-semibold border border-green/30 hover:bg-green/30 transition-colors disabled:opacity-50"
          >
            {verifying ? 'Verifying...' : 'Verify Fee-Share Setup'}
          </button>
        </div>
      )}

      {/* Step 3: Ready */}
      {isOnChain && verified && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-green">✓</span>
            <span className="text-xs text-green font-medium">Vault created</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green">✓</span>
            <span className="text-xs text-green font-medium">Fee-share verified</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Trade fees are now flowing to your vault. Use the Distribute button below when ready.
          </p>
        </div>
      )}

      {error && <p className="text-xs text-red mt-2">{error}</p>}
    </motion.div>
  );
}
