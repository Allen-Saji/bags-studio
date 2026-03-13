'use client';

import { use } from 'react';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import Link from 'next/link';
import DashboardHeader from '@/components/studio/DashboardHeader';
import SwapCard from '@/components/studio/SwapCard';

const fetcher = (url: string) => fetch(url).then(r => {
  if (!r.ok) throw new Error(`${r.status}`);
  return r.json();
});

export default function TradePage({ params }: { params: Promise<{ mint: string }> }) {
  const { mint } = use(params);

  const { data, isLoading, error } = useSWR(
    `/api/dashboard/${mint}`,
    fetcher,
    { revalidateOnFocus: false },
  );

  if (error) {
    return (
      <div className="max-w-2xl mx-auto pt-12 text-center">
        <div className="text-red text-lg mb-2">Token not found</div>
        <p className="text-gray-500 text-sm mb-6">Could not load token data.</p>
        <Link href="/studio" className="text-green hover:underline text-sm">
          ← Back to coins
        </Link>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center pt-24">
        <div className="w-6 h-6 border-2 border-green/30 border-t-green rounded-full animate-spin" />
      </div>
    );
  }

  const creator = data.creators?.find((c: { isCreator: boolean }) => c.isCreator);
  const token = {
    mint,
    name: data.token.name || creator?.bagsUsername || mint.slice(0, 8),
    symbol: data.token.symbol || '',
    image: data.token.image || creator?.pfp || '',
    creator: creator?.wallet,
    creators: data.creators || [],
    description: data.token.description || '',
  };

  return (
    <div>
      <DashboardHeader token={token} totalSupporters={data.totalSupporters || 0} />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-6"
      >
        <SwapCard mint={mint} tokenSymbol={token.symbol} />
      </motion.div>
    </div>
  );
}
