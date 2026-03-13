'use client';

import { use } from 'react';
import useSWR from 'swr';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import VaultConfig from '@/components/studio/VaultConfig';
import RewardEpoch from '@/components/studio/RewardEpoch';
import ClaimReward from '@/components/studio/ClaimReward';

const fetcher = (url: string) => fetch(url).then(r => {
  if (!r.ok) throw new Error(`${r.status}`);
  return r.json();
});

export default function RewardsPage({ params }: { params: Promise<{ mint: string }> }) {
  const { mint } = use(params);
  const { publicKey } = useWallet();
  const wallet = publicKey?.toBase58();

  const { data: dashData } = useSWR(`/api/dashboard/${mint}`, fetcher, {
    revalidateOnFocus: false,
  });

  const { data: vaultData, isLoading, error, mutate } = useSWR(
    `/api/engage/${mint}/vault`,
    fetcher,
  );

  const creator = dashData?.creators?.find((c: { isCreator: boolean }) => c.isCreator);
  const isCreator = wallet && creator?.wallet === wallet;

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

  return (
    <div>
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-display font-bold mb-8"
      >
        Rewards
      </motion.h1>

      <div className="space-y-8">
        {/* Creator: vault config */}
        {isCreator && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <VaultConfig
              vault={vault}
              mint={mint}
              creatorWallet={wallet!}
              onSetup={() => mutate()}
            />
          </motion.div>
        )}

        {/* Epoch history */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <RewardEpoch epochs={epochs} />
        </motion.div>

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
