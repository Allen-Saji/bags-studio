'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion } from 'framer-motion';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function ReferralCard({ mint }: { mint: string }) {
  const { publicKey } = useWallet();
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  const wallet = publicKey?.toBase58();

  const { data, mutate } = useSWR(
    wallet ? `/api/engage/${mint}/points/${wallet}` : null,
    fetcher,
  );

  const [referralData, setReferralData] = useState<{
    code: string;
    link: string;
    stats: { total: number; verified: number; pending: number };
  } | null>(null);

  const generateCode = async () => {
    if (!wallet) return;
    setGenerating(true);
    try {
      const res = await fetch(`/api/engage/${mint}/referral`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet }),
      });
      if (res.ok) {
        const data = await res.json();
        setReferralData(data);
      }
    } finally {
      setGenerating(false);
    }
  };

  const copyLink = () => {
    if (!referralData) return;
    navigator.clipboard.writeText(referralData.link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!wallet) {
    return (
      <div className="rounded-xl border border-border-subtle p-5">
        <h3 className="text-sm font-display font-bold mb-2">Referral Program</h3>
        <p className="text-xs text-gray-500">Connect wallet to generate your referral link.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border-subtle p-5"
    >
      <h3 className="text-sm font-display font-bold mb-3">Referral Program</h3>

      {referralData ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={referralData.link}
              className="flex-1 px-3 py-2 rounded-lg bg-surface-2 border border-border-subtle text-xs font-mono text-gray-300"
            />
            <button
              onClick={copyLink}
              className="px-3 py-2 rounded-lg bg-green/20 text-green text-xs font-mono border border-green/30 hover:bg-green/30 transition-colors"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 rounded-lg bg-surface-2 text-center">
              <div className="text-sm font-mono font-bold text-white">{referralData.stats.total}</div>
              <div className="text-[10px] text-gray-500">Total</div>
            </div>
            <div className="p-2 rounded-lg bg-surface-2 text-center">
              <div className="text-sm font-mono font-bold text-green">{referralData.stats.verified}</div>
              <div className="text-[10px] text-gray-500">Verified</div>
            </div>
            <div className="p-2 rounded-lg bg-surface-2 text-center">
              <div className="text-sm font-mono font-bold text-yellow-400">{referralData.stats.pending}</div>
              <div className="text-[10px] text-gray-500">Pending</div>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={generateCode}
          disabled={generating}
          className="w-full py-2.5 rounded-lg bg-green text-black text-sm font-semibold hover:bg-green-dark transition-colors disabled:opacity-50"
        >
          {generating ? 'Generating...' : 'Get Referral Link'}
        </button>
      )}
    </motion.div>
  );
}
