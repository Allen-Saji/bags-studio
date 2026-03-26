'use client';

import { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { Transaction } from '@solana/web3.js';
import { motion } from 'framer-motion';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function StakingCard({ mint }: { mint: string }) {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const wallet = publicKey?.toBase58();

  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { data: poolData, mutate } = useSWR(`/api/engage/${mint}/stake/pool`, fetcher);
  const pool = poolData?.pool;

  const sendTx = useCallback(async (url: string, method: string, body: Record<string, unknown>) => {
    if (!publicKey || !signTransaction) throw new Error('Connect wallet');
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Transaction failed');
    }
    const { transaction } = await res.json();
    const tx = Transaction.from(Buffer.from(transaction, 'base64'));
    const signed = await signTransaction(tx);
    const sig = await connection.sendRawTransaction(signed.serialize());
    await connection.confirmTransaction(sig, 'confirmed');
    return sig;
  }, [publicKey, signTransaction, connection]);

  const handleStake = useCallback(async () => {
    if (!wallet || !amount) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // First open position if needed (will fail silently if exists)
      try {
        await sendTx(`/api/engage/${mint}/stake/open`, 'POST', { wallet });
      } catch {
        // Position might already exist — that's fine
      }

      // Get user's ATA for this token
      const { getAssociatedTokenAddress } = await import('@solana/spl-token');
      const { PublicKey } = await import('@solana/web3.js');
      const tokenMint = new PublicKey(mint);
      const userATA = await getAssociatedTokenAddress(tokenMint, new PublicKey(wallet));

      await sendTx(`/api/engage/${mint}/stake`, 'POST', {
        wallet,
        amount: parseFloat(amount) * 1e9, // Assume 9 decimals
        user_token_account: userATA.toBase58(),
      });
      setSuccess(`Staked ${amount} tokens!`);
      setAmount('');
      mutate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Stake failed');
    } finally {
      setLoading(false);
    }
  }, [wallet, amount, mint, sendTx, mutate]);

  const handleUnstake = useCallback(async () => {
    if (!wallet || !amount) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const { getAssociatedTokenAddress } = await import('@solana/spl-token');
      const { PublicKey } = await import('@solana/web3.js');
      const tokenMint = new PublicKey(mint);
      const userATA = await getAssociatedTokenAddress(tokenMint, new PublicKey(wallet));

      await sendTx(`/api/engage/${mint}/stake`, 'DELETE', {
        wallet,
        amount: parseFloat(amount) * 1e9,
        user_token_account: userATA.toBase58(),
      });
      setSuccess(`Unstaked ${amount} tokens. Current epoch points forfeited.`);
      setAmount('');
      mutate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unstake failed');
    } finally {
      setLoading(false);
    }
  }, [wallet, amount, mint, sendTx, mutate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border-subtle p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-display font-bold">Stake Tokens</h3>
        {pool?.exists && (
          <span className="text-[10px] font-mono text-green px-2 py-0.5 rounded-full bg-green/10 border border-green/20">
            Pool Active
          </span>
        )}
      </div>

      {!pool?.exists ? (
        <p className="text-xs text-gray-500 text-center py-4">
          Staking pool not configured for this token yet.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 rounded-lg bg-surface-2">
              <div className="text-[10px] text-gray-500 uppercase">Stakers</div>
              <div className="text-sm font-mono font-bold text-white">{poolData?.stakerCount || 0}</div>
            </div>
            <div className="p-3 rounded-lg bg-surface-2">
              <div className="text-[10px] text-gray-500 uppercase">Points/Token/Day</div>
              <div className="text-sm font-mono font-bold text-green">1</div>
            </div>
          </div>

          {wallet ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Amount</label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2.5 rounded-lg bg-surface-2 border border-border-subtle text-sm font-mono text-white placeholder:text-gray-600 focus:outline-none focus:border-green/50 transition-colors"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleStake}
                  disabled={loading || !amount}
                  className="flex-1 py-2.5 rounded-lg bg-green text-black text-sm font-semibold hover:bg-green-dark transition-colors disabled:opacity-50"
                >
                  {loading ? 'Signing...' : 'Stake'}
                </button>
                <button
                  onClick={handleUnstake}
                  disabled={loading || !amount}
                  className="flex-1 py-2.5 rounded-lg bg-surface-2 border border-border-subtle text-sm font-semibold text-gray-300 hover:text-white hover:border-green/30 transition-colors disabled:opacity-50"
                >
                  {loading ? '...' : 'Unstake'}
                </button>
              </div>
              <p className="text-[10px] text-gray-600">
                Unstaking forfeits points earned in the current epoch.
              </p>
            </div>
          ) : (
            <p className="text-xs text-gray-500 text-center py-2">Connect wallet to stake.</p>
          )}
        </>
      )}

      {error && <p className="text-xs text-red mt-2">{error}</p>}
      {success && <p className="text-xs text-green mt-2">{success}</p>}
    </motion.div>
  );
}
