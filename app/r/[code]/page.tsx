'use client';

import { use, useEffect, useState } from 'react';
import useSWR from 'swr';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { WalletContextProvider } from '@/lib/wallet-context';
import WalletStatus from '@/components/studio/WalletStatus';
import TierBadge from '@/components/studio/TierBadge';

const fetcher = (url: string) => fetch(url).then(r => {
  if (!r.ok) throw new Error(`${r.status}`);
  return r.json();
});

function ReferralContent({ code }: { code: string }) {
  const { publicKey } = useWallet();
  const wallet = publicKey?.toBase58();
  const [recorded, setRecorded] = useState(false);

  const { data, isLoading, error } = useSWR(
    `/api/engage/lookup-referral/${code}`,
    fetcher,
  );

  // Record referral visit when wallet connects
  useEffect(() => {
    if (!wallet || !data?.mint_address || recorded) return;

    fetch(`/api/engage/${data.mint_address}/referral/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ referred_wallet: wallet, referral_code: code }),
    }).then(() => setRecorded(true)).catch(() => {});
  }, [wallet, data, code, recorded]);

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="text-red text-lg mb-2">Invalid Referral Link</div>
        <p className="text-gray-500 text-sm mb-6">This referral code is not valid or has expired.</p>
        <Link href="/" className="text-green hover:underline text-sm">
          ← Go to Bags
        </Link>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-green/30 border-t-green rounded-full animate-spin" />
      </div>
    );
  }

  const { mint_address, token, referrer, tiers } = data;

  return (
    <div className="max-w-lg mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        {token?.image && (
          <img
            src={token.image}
            alt={token.name}
            className="w-20 h-20 rounded-full mx-auto mb-4 border-2 border-green/30"
          />
        )}
        <h1 className="text-3xl font-display font-bold mb-2">
          {token?.name || mint_address.slice(0, 8)}
        </h1>
        {token?.symbol && (
          <p className="text-lg font-mono text-gray-400">${token.symbol}</p>
        )}
        {referrer && (
          <p className="text-sm text-gray-500 mt-3">
            Referred by{' '}
            <span className="font-mono text-gray-300">
              {referrer.slice(0, 6)}...{referrer.slice(-4)}
            </span>
          </p>
        )}
      </motion.div>

      {/* Tier breakdown */}
      {tiers && tiers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border-subtle p-5 mb-8"
        >
          <h3 className="text-sm font-display font-bold mb-4 text-center">Supporter Tiers</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {tiers.map((tier: { name: string; count: number }) => (
              <div
                key={tier.name}
                className="p-3 rounded-lg bg-surface-2 border border-border-subtle text-center"
              >
                <TierBadge tier={tier.name as import('@/lib/types').ConvictionTier} />
                <div className="text-sm font-mono font-bold text-white mt-1">{tier.count}</div>
                <div className="text-[10px] text-gray-500">holders</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {token?.description && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-sm text-gray-400 text-center mb-8 leading-relaxed"
        >
          {token.description}
        </motion.p>
      )}

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        <a
          href={`https://bags.fm/token/${mint_address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-4 rounded-xl bg-green text-black text-center text-sm font-semibold hover:bg-green-dark transition-colors"
        >
          Buy on Bags
        </a>
        <Link
          href={`/studio/${mint_address}`}
          className="block w-full py-3 rounded-xl bg-surface-2 border border-border-subtle text-center text-sm text-gray-300 hover:text-green hover:border-green/30 transition-colors"
        >
          View Dashboard
        </Link>
      </motion.div>
    </div>
  );
}

export default function ReferralPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);

  return (
    <WalletContextProvider>
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-green/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-green/5 rounded-full blur-[120px] pointer-events-none" />

        {/* Header */}
        <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-black/50 backdrop-blur-sm">
          <Link href="/" className="text-sm font-display font-bold text-white">
            BagsStudio
          </Link>
          <WalletStatus />
        </header>

        {/* Content */}
        <main className="relative z-10 px-6 py-16">
          <ReferralContent code={code} />
        </main>
      </div>
    </WalletContextProvider>
  );
}
