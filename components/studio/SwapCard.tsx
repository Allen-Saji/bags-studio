'use client';

import { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { Transaction } from '@solana/web3.js';
import { motion } from 'framer-motion';
import useSWR from 'swr';

const SOL_MINT = 'So11111111111111111111111111111111111111112';
const fetcher = (url: string) => fetch(url).then(r => r.json());

interface SwapCardProps {
  mint: string;
  tokenSymbol?: string;
}

export default function SwapCard({ mint, tokenSymbol = 'TOKEN' }: SwapCardProps) {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [direction, setDirection] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [slippage, setSlippage] = useState('100'); // 1% default (in bps)
  const [swapping, setSwapping] = useState(false);
  const [error, setError] = useState('');
  const [txSig, setTxSig] = useState('');

  const inputMint = direction === 'buy' ? SOL_MINT : mint;
  const outputMint = direction === 'buy' ? mint : SOL_MINT;

  // Fetch quote when amount changes
  const { data: quote } = useSWR(
    amount && parseFloat(amount) > 0
      ? `/api/trade/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippage}`
      : null,
    fetcher,
    { refreshInterval: 10000, dedupingInterval: 2000 },
  );

  const handleSwap = useCallback(async () => {
    if (!publicKey || !signTransaction || !amount) return;
    setSwapping(true);
    setError('');
    setTxSig('');

    try {
      const res = await fetch('/api/trade/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputMint,
          outputMint,
          amount,
          slippageBps: parseInt(slippage),
          wallet: publicKey.toBase58(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Swap failed');
      }

      const { transaction: txBase64 } = await res.json();
      const tx = Transaction.from(Buffer.from(txBase64, 'base64'));
      const signed = await signTransaction(tx);
      const sig = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(sig, 'confirmed');
      setTxSig(sig);
      setAmount('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Swap failed');
    } finally {
      setSwapping(false);
    }
  }, [publicKey, signTransaction, amount, inputMint, outputMint, slippage, connection]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border-subtle p-5 max-w-md"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-display font-bold">Swap</h3>
        <div className="flex rounded-lg overflow-hidden border border-border-subtle">
          <button
            onClick={() => setDirection('buy')}
            className={`px-3 py-1 text-xs font-mono transition-colors ${
              direction === 'buy'
                ? 'bg-green/20 text-green'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Buy
          </button>
          <button
            onClick={() => setDirection('sell')}
            className={`px-3 py-1 text-xs font-mono transition-colors ${
              direction === 'sell'
                ? 'bg-red/20 text-red'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Sell
          </button>
        </div>
      </div>

      {/* Input */}
      <div className="space-y-3">
        <div>
          <label className="text-[10px] text-gray-500 uppercase tracking-wider">
            {direction === 'buy' ? 'You pay (SOL)' : `You pay (${tokenSymbol})`}
          </label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0.0"
            className="w-full mt-1 px-4 py-3 rounded-lg bg-surface-2 border border-border-subtle text-white font-mono text-lg placeholder:text-gray-600 focus:outline-none focus:border-green/50 transition-colors"
          />
        </div>

        {/* Quote preview */}
        {quote && !quote.error && (
          <div className="p-3 rounded-lg bg-surface-2 border border-border-subtle">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">You receive</span>
              <span className="font-mono text-white">
                {direction === 'buy'
                  ? `${parseFloat(quote.outAmount).toLocaleString()} ${tokenSymbol}`
                  : `${(parseFloat(quote.outAmount) / 1e9).toFixed(4)} SOL`}
              </span>
            </div>
            {quote.priceImpactPct && (
              <div className="flex justify-between text-xs mt-1">
                <span className="text-gray-500">Price Impact</span>
                <span className={`font-mono ${parseFloat(quote.priceImpactPct) > 3 ? 'text-red' : 'text-gray-400'}`}>
                  {parseFloat(quote.priceImpactPct).toFixed(2)}%
                </span>
              </div>
            )}
          </div>
        )}

        {/* Slippage */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500">Slippage</span>
          <div className="flex gap-1">
            {['50', '100', '200', '500'].map(bps => (
              <button
                key={bps}
                onClick={() => setSlippage(bps)}
                className={`px-2 py-0.5 text-[10px] font-mono rounded transition-colors ${
                  slippage === bps
                    ? 'bg-green/20 text-green border border-green/30'
                    : 'bg-surface-2 text-gray-500 border border-border-subtle'
                }`}
              >
                {(parseInt(bps) / 100).toFixed(1)}%
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-xs text-red">{error}</p>}

        {txSig && (
          <p className="text-xs text-green font-mono">
            Success! Tx: {txSig.slice(0, 8)}...
          </p>
        )}

        <button
          onClick={handleSwap}
          disabled={swapping || !publicKey || !amount}
          className={`w-full py-3 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${
            direction === 'buy'
              ? 'bg-green text-black hover:bg-green-dark'
              : 'bg-red text-white hover:bg-red/80'
          }`}
        >
          {swapping
            ? 'Swapping...'
            : !publicKey
            ? 'Connect Wallet'
            : `${direction === 'buy' ? 'Buy' : 'Sell'} ${tokenSymbol}`}
        </button>
      </div>
    </motion.div>
  );
}
