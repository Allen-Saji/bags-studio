'use client';

import { use, useState } from 'react';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import Link from 'next/link';
import VaultConfig from '@/components/studio/VaultConfig';
import RewardEpoch from '@/components/studio/RewardEpoch';
import ClaimReward from '@/components/studio/ClaimReward';
import { useTokenRole } from '@/lib/use-token-role';

const fetcher = (url: string) => fetch(url).then(r => {
  if (!r.ok) throw new Error(`${r.status}`);
  return r.json();
});

const STEPS = [
  { n: 1, title: 'Create Reward Vault', desc: 'Set up the wallet where trade fees will accumulate for your supporters.' },
  { n: 2, title: 'Configure Fee Share on Bags', desc: 'Set your vault wallet as a fee-share recipient so trade fees flow in automatically.' },
  { n: 3, title: 'Fees Accumulate', desc: 'Every trade on your token sends a % of fees to your vault wallet.' },
  { n: 4, title: 'Weekly Distribution', desc: 'Each week, vault balance is distributed pro-rata based on engagement points.' },
  { n: 5, title: 'Supporters Claim', desc: 'Top supporters come and claim their SOL rewards from the vault.' },
];

function SetupGuide({ currentStep, mint, vaultWallet }: { currentStep: number; mint: string; vaultWallet?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border-subtle p-5 mb-6"
    >
      <h3 className="text-sm font-display font-bold mb-1">How Rewards Work</h3>
      <p className="text-xs text-gray-500 mb-5">Follow these steps to start distributing trade fee rewards to your top supporters.</p>

      <div className="space-y-3">
        {STEPS.map((step) => {
          const isDone = step.n < currentStep;
          const isCurrent = step.n === currentStep;

          return (
            <div
              key={step.n}
              className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                isCurrent ? 'bg-green/5 border border-green/20' :
                isDone ? 'bg-surface-2 border border-border-subtle opacity-60' :
                'bg-surface border border-border-subtle opacity-40'
              }`}
            >
              <div className={`flex items-center justify-center w-6 h-6 rounded-full shrink-0 text-xs font-mono font-bold ${
                isDone ? 'bg-green text-black' :
                isCurrent ? 'bg-green/20 text-green border border-green/30' :
                'bg-surface-2 text-gray-600 border border-border-subtle'
              }`}>
                {isDone ? '✓' : step.n}
              </div>
              <div className="min-w-0">
                <div className={`text-sm font-medium ${isCurrent ? 'text-white' : isDone ? 'text-gray-400' : 'text-gray-500'}`}>
                  {step.title}
                </div>
                <div className="text-[10px] text-gray-500 mt-0.5">{step.desc}</div>
                {/* Step 2 action: link to Bags fee-share config */}
                {isCurrent && step.n === 2 && vaultWallet && (
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-2 border border-border-subtle">
                      <span className="text-[10px] text-gray-500">Vault wallet:</span>
                      <code className="text-[10px] font-mono text-green break-all">{vaultWallet}</code>
                    </div>
                    <p className="text-[10px] text-gray-400">
                      Go to your token&apos;s fee-share settings on Bags and add the vault wallet above as a recipient.
                      Set the basis points (e.g., 2500 = 25% of fees).
                    </p>
                    <a
                      href={`https://bags.fm/token/${mint}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg bg-green/20 text-green border border-green/30 hover:bg-green/30 transition-colors"
                    >
                      Open on Bags →
                    </a>
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

function ManualEpochTrigger({ mint, onCreated }: { mint: string; onCreated: () => void }) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTrigger = async () => {
    setRunning(true);
    setResult(null);

    try {
      // First get vault balance
      const vaultRes = await fetch(`/api/engage/${mint}/vault`);
      const vaultData = await vaultRes.json();
      const vault = vaultData?.vault;

      if (!vault) {
        setResult({ success: false, message: 'Vault not configured' });
        return;
      }

      // Fetch vault SOL balance via RPC
      const rpcUrl = '/api/engage/' + mint + '/vault/balance';
      // Use the epoch endpoint directly
      const res = await fetch(`/api/engage/${mint}/rewards/epoch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vault_balance_lamports: 0 }), // Let server fetch balance
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create epoch');
      }

      setResult({ success: true, message: 'Epoch created! Rewards distributed to eligible wallets.' });
      onCreated();
    } catch (err) {
      setResult({ success: false, message: err instanceof Error ? err.message : 'Failed' });
    } finally {
      setRunning(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border-subtle p-5"
    >
      <h3 className="text-sm font-display font-bold mb-1">Distribute Rewards</h3>
      <p className="text-xs text-gray-500 mb-4">
        Trigger a distribution now. This snapshots the current leaderboard and allocates the vault balance pro-rata based on engagement points.
      </p>

      <div className="rounded-lg bg-surface-2 border border-border-subtle p-3 mb-4">
        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">How distribution works</div>
        <div className="text-xs text-gray-400 space-y-1">
          <p>1. Reads your vault wallet&apos;s SOL balance</p>
          <p>2. Snapshots the engagement leaderboard</p>
          <p>3. Allocates: <span className="text-green font-mono">(wallet_points / total_points) × vault_balance</span></p>
          <p>4. Creates claimable rewards for each eligible wallet</p>
        </div>
      </div>

      <button
        onClick={handleTrigger}
        disabled={running}
        className="w-full py-2.5 rounded-lg bg-green text-black text-sm font-semibold hover:bg-green-dark transition-colors disabled:opacity-50"
      >
        {running ? 'Creating epoch...' : 'Distribute Now'}
      </button>

      {result && (
        <p className={`text-xs mt-2 ${result.success ? 'text-green' : 'text-red'}`}>
          {result.message}
        </p>
      )}
    </motion.div>
  );
}

export default function RewardsPage({ params }: { params: Promise<{ mint: string }> }) {
  const { mint } = use(params);
  const { isCreator, wallet } = useTokenRole(mint);

  const { data: vaultData, isLoading, error, mutate } = useSWR(
    `/api/engage/${mint}/vault`,
    fetcher,
  );

  if (error) {
    return (
      <div className="max-w-md mx-auto pt-12 text-center">
        <div className="text-red text-lg mb-2">Could not load rewards</div>
        <Link href={`/studio/${mint}`} className="text-green hover:underline text-sm">
          ← Back to dashboard
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center pt-24">
        <div className="w-6 h-6 border-2 border-green/30 border-t-green rounded-full animate-spin" />
      </div>
    );
  }

  const vault = vaultData?.vault || null;
  const epochs = vaultData?.epochs || [];

  // Determine current setup step
  let currentStep = 1;
  if (vault) currentStep = 2; // Vault created, need fee-share config
  if (vault && epochs.length > 0) currentStep = 5; // Already distributed, supporters can claim
  // Note: We can't verify step 2 (fee-share config on Bags) from our side,
  // so after vault creation we show step 2 guidance and let creator proceed

  return (
    <div className="max-w-3xl">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-display font-bold mb-2"
      >
        Rewards
      </motion.h1>
      <p className="text-sm text-gray-500 mb-6">
        Distribute trade fees to your top supporters based on engagement points.
      </p>

      <div className="space-y-6">
        {/* Setup guide — always visible for creators */}
        {isCreator && (
          <SetupGuide
            currentStep={currentStep}
            mint={mint}
            vaultWallet={vault?.vault_wallet}
          />
        )}

        {/* Step 1: Vault config — creator only */}
        {isCreator && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <VaultConfig
              vault={vault}
              mint={mint}
              creatorWallet={wallet || ''}
              onSetup={() => mutate()}
            />
          </motion.div>
        )}

        {/* Manual distribute — creator only, only if vault exists */}
        {isCreator && vault && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <ManualEpochTrigger mint={mint} onCreated={() => mutate()} />
          </motion.div>
        )}

        {/* Epoch history */}
        {epochs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <RewardEpoch epochs={epochs} />
          </motion.div>
        )}

        {/* Supporter: claim rewards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ClaimReward mint={mint} />
        </motion.div>
      </div>
    </div>
  );
}
