'use client';

import { use, useState } from 'react';
import useSWR from 'swr';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { Transaction } from '@solana/web3.js';
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
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTrigger = async () => {
    if (!publicKey || !signTransaction) return;
    setRunning(true);
    setResult(null);

    try {
      // Call distribute endpoint — builds merkle tree + returns unsigned tx
      const res = await fetch(`/api/engage/${mint}/rewards/distribute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caller: publicKey.toBase58() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create distribution');
      }

      const { transaction, eligibleWallets, totalAllocation } = await res.json();

      // Sign and send the update_distribution tx
      const tx = Transaction.from(Buffer.from(transaction, 'base64'));
      const signed = await signTransaction(tx);
      const sig = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(sig, 'confirmed');

      setResult({
        success: true,
        message: `Distributed ${(totalAllocation / 1e9).toFixed(4)} SOL to ${eligibleWallets} wallets. Tx: ${sig.slice(0, 8)}...`,
      });
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
        Snapshot the leaderboard and post a merkle root on-chain. Holders can then claim their SOL.
      </p>

      <div className="rounded-lg bg-surface-2 border border-border-subtle p-3 mb-4">
        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">How it works</div>
        <div className="text-xs text-gray-400 space-y-1">
          <p>1. Reads the Treasury PDA&apos;s SOL balance</p>
          <p>2. Snapshots the engagement leaderboard</p>
          <p>3. Builds a merkle tree: <span className="text-green font-mono">(points / total) x balance</span></p>
          <p>4. Posts merkle root on-chain — holders claim with proofs</p>
        </div>
      </div>

      {!publicKey ? (
        <p className="text-xs text-yellow-500">Connect a wallet to sign the distribution transaction.</p>
      ) : (
        <button
          onClick={handleTrigger}
          disabled={running}
          className="w-full py-2.5 rounded-lg bg-green text-black text-sm font-semibold hover:bg-green-dark transition-colors disabled:opacity-50"
        >
          {running ? 'Distributing...' : 'Distribute Now'}
        </button>
      )}

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
