'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import useSWR from 'swr';
import { AdminToken } from '@/lib/types';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function CoinSelector() {
  const [mintInput, setMintInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Fetch admin tokens for auto-detect
  const { data: adminTokens } = useSWR<AdminToken[]>('/api/bags/fee-share/admin/list', fetcher, {
    revalidateOnFocus: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const mint = mintInput.trim();
    if (!mint) return;

    // Basic validation: Solana addresses are 32-44 chars base58
    if (mint.length < 32 || mint.length > 44) {
      setError('Invalid mint address format');
      return;
    }

    setLoading(true);
    try {
      // Validate by trying to fetch token info
      const res = await fetch(`/api/bags/token/${mint}`);
      if (!res.ok) {
        setError('Token not found on Bags. Make sure this is a valid Bags coin.');
        setLoading(false);
        return;
      }
      router.push(`/studio/${mint}`);
    } catch {
      setError('Failed to validate token. Please try again.');
      setLoading(false);
    }
  };

  const handleSelectToken = (mint: string) => {
    router.push(`/studio/${mint}`);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Mint input */}
        <div>
          <h2 className="text-2xl font-display font-bold mb-2">Connect Your Coin</h2>
          <p className="text-gray-400 mb-6">
            Paste your token&apos;s mint address to view supporter analytics
          </p>

          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={mintInput}
              onChange={e => setMintInput(e.target.value)}
              placeholder="Token mint address..."
              className="flex-1 px-4 py-3 rounded-lg bg-surface-2 border border-border-subtle text-white placeholder:text-gray-500 font-mono text-sm focus:outline-none focus:border-green/50 transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !mintInput.trim()}
              className="px-6 py-3 rounded-lg bg-green text-black font-semibold text-sm hover:bg-green-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                'Analyze'
              )}
            </button>
          </form>

          {error && (
            <p className="mt-3 text-sm text-red">{error}</p>
          )}
        </div>

        {/* Admin tokens (auto-detect) */}
        {adminTokens && adminTokens.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Your Coins
            </h3>
            <div className="grid gap-3">
              {adminTokens.map(token => (
                <button
                  key={token.mint}
                  onClick={() => handleSelectToken(token.mint)}
                  className="flex items-center gap-4 p-4 rounded-lg bg-surface-2 border border-border-subtle hover:border-green/30 transition-all group text-left"
                >
                  {token.image && (
                    <img
                      src={token.image}
                      alt={token.name}
                      className="w-10 h-10 rounded-full"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold group-hover:text-green transition-colors">
                      {token.name}
                    </div>
                    <div className="text-xs font-mono text-gray-500 truncate">
                      {token.mint}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 font-mono">
                    ${token.symbol}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
