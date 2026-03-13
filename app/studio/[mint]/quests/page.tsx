'use client';

import { use } from 'react';
import useSWR from 'swr';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import QuestList from '@/components/studio/QuestList';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function QuestsPage({ params }: { params: Promise<{ mint: string }> }) {
  const { mint } = use(params);
  const { publicKey } = useWallet();
  const wallet = publicKey?.toBase58();

  const { data } = useSWR(`/api/dashboard/${mint}`, fetcher, {
    revalidateOnFocus: false,
  });

  const creator = data?.creators?.find((c: { isCreator: boolean }) => c.isCreator);
  const isCreator = wallet && creator?.wallet === wallet;

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <h1 className="text-2xl font-display font-bold">Quests</h1>
        {isCreator && (
          <Link
            href={`/studio/${mint}/quests/new`}
            className="px-4 py-2 rounded-lg bg-green text-black text-sm font-semibold hover:bg-green-dark transition-colors"
          >
            Create Quest
          </Link>
        )}
      </motion.div>

      <QuestList mint={mint} />
    </div>
  );
}
