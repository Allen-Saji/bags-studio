'use client';

import { use } from 'react';
import useSWR from 'swr';
import { useWallet } from '@solana/wallet-adapter-react';
import Link from 'next/link';
import QuestBuilder from '@/components/studio/QuestBuilder';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function NewQuestPage({ params }: { params: Promise<{ mint: string }> }) {
  const { mint } = use(params);
  const { publicKey } = useWallet();
  const wallet = publicKey?.toBase58();

  const { data, isLoading } = useSWR(`/api/dashboard/${mint}`, fetcher, {
    revalidateOnFocus: false,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center pt-24">
        <div className="w-6 h-6 border-2 border-green/30 border-t-green rounded-full animate-spin" />
      </div>
    );
  }

  const creator = data?.creators?.find((c: { isCreator: boolean }) => c.isCreator);
  const isCreator = wallet && creator?.wallet === wallet;

  if (!wallet || !isCreator) {
    return (
      <div className="max-w-md mx-auto pt-12 text-center">
        <div className="text-red text-lg mb-2">Access Denied</div>
        <p className="text-gray-500 text-sm mb-6">
          {!wallet
            ? 'Connect your wallet to create quests.'
            : 'Only the token creator can create quests.'}
        </p>
        <Link href={`/studio/${mint}/quests`} className="text-green hover:underline text-sm">
          ← Back to quests
        </Link>
      </div>
    );
  }

  return <QuestBuilder mint={mint} creatorWallet={wallet} />;
}
