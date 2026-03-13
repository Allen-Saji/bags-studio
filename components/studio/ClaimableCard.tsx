'use client';

import { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { Transaction } from '@solana/web3.js';
import { motion } from 'framer-motion';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function ClaimableCard({ mint }: { mint: string }) {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const wallet = publicKey?.toBase58();

  const { data, mutate } = useSWR(
    wallet ? `/api/fees/positions?wallet=${wallet}` : null,
    fetcher,
  );

  const positions = data?.positions || [];
  const position = positions.find(
    (p: { tokenMint: string }) => p.tokenMint === mint,
  );

  const claimableSOL = position
    ? parseFloat(position.claimableAmount) / 1e9
    : 0;

  const handleClaim = useCallback(async () => {
    if (!wallet || !signTransaction || claimableSOL <= 0) return;
    setClaiming(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('/api/fees/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet, tokenMint: mint }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Claim failed');
      }

      const { transactions } = await res.json();

      // Sign and send each tx
      for (const txBase64 of transactions) {
        const tx = Transaction.from(Buffer.from(txBase64, 'base64'));
        const signed = await signTransaction(tx);
        const sig = await connection.sendRawTransaction(signed.serialize());
        await connection.confirmTransaction(sig, 'confirmed');
      }

      setSuccess(true);
      mutate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Claim failed');
    } finally {
      setClaiming(false);
    }
  }, [wallet, signTransaction, claimableSOL, mint, connection, mutate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border-subtle p-5"
    >
      <h3 className="text-sm font-display font-bold mb-3">Claimable Fees</h3>

      {!wallet ? (
        <p className="text-xs text-gray-500">Connect wallet to see claimable fees.</p>
      ) : claimableSOL > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Available</span>
            <span className="text-xl font-mono font-bold text-green">
              {claimableSOL.toFixed(4)} SOL
            </span>
          </div>

          {error && <p className="text-xs text-red">{error}</p>}
          {success && <p className="text-xs text-green">Claimed successfully!</p>}

          <button
            onClick={handleClaim}
            disabled={claiming}
            className="w-full py-2.5 rounded-lg bg-green text-black text-sm font-semibold hover:bg-green-dark transition-colors disabled:opacity-50"
          >
            {claiming ? 'Claiming...' : 'Claim Fees'}
          </button>
        </div>
      ) : (
        <p className="text-xs text-gray-500">No claimable fees at this time.</p>
      )}
    </motion.div>
  );
}
