'use client';

import { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { Transaction } from '@solana/web3.js';
import { motion } from 'framer-motion';

type Step = 'details' | 'feeshare' | 'buy' | 'review' | 'done';

interface TokenDetails {
  name: string;
  symbol: string;
  description: string;
  image: string;
  twitter: string;
  telegram: string;
  website: string;
}

interface FeeShareEntry {
  wallet: string;
  bps: number;
}

export default function LaunchWizard() {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [step, setStep] = useState<Step>('details');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [txSig, setTxSig] = useState('');

  const [details, setDetails] = useState<TokenDetails>({
    name: '',
    symbol: '',
    description: '',
    image: '',
    twitter: '',
    telegram: '',
    website: '',
  });

  const [feeShare, setFeeShare] = useState<FeeShareEntry[]>([
    { wallet: '', bps: 5000 },
  ]);

  const [initialBuy, setInitialBuy] = useState('0');
  const [metadataUri, setMetadataUri] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setDetails(d => ({ ...d, image: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const addFeeShareEntry = () => {
    setFeeShare(fs => [...fs, { wallet: '', bps: 0 }]);
  };

  const removeFeeShareEntry = (idx: number) => {
    setFeeShare(fs => fs.filter((_, i) => i !== idx));
  };

  const updateFeeShare = (idx: number, field: 'wallet' | 'bps', value: string) => {
    setFeeShare(fs =>
      fs.map((entry, i) =>
        i === idx
          ? { ...entry, [field]: field === 'bps' ? parseInt(value) || 0 : value }
          : entry,
      ),
    );
  };

  const handleUploadMetadata = useCallback(async () => {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/launch/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(details),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to upload metadata');
      const data = await res.json();
      setMetadataUri(data.uri || data.metadataUri || '');
      setStep('feeshare');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setSubmitting(false);
    }
  }, [details]);

  const handleLaunch = useCallback(async () => {
    if (!publicKey || !signTransaction) return;
    setSubmitting(true);
    setError('');

    try {
      // Configure fee share if entries exist
      const validEntries = feeShare.filter(e => e.wallet && e.bps > 0);
      if (validEntries.length > 0) {
        await fetch('/api/launch/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tokenMint: '', // Will be set after launch
            claimersArray: validEntries,
          }),
        });
      }

      // Create launch tx
      const res = await fetch('/api/launch/tx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: details.name,
          symbol: details.symbol,
          uri: metadataUri,
          initialBuyLamports: parseFloat(initialBuy) * 1e9,
          wallet: publicKey.toBase58(),
        }),
      });

      if (!res.ok) throw new Error((await res.json()).error || 'Failed to create tx');
      const { transaction: txBase64 } = await res.json();

      const tx = Transaction.from(Buffer.from(txBase64, 'base64'));
      const signed = await signTransaction(tx);
      const sig = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(sig, 'confirmed');
      setTxSig(sig);
      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Launch failed');
    } finally {
      setSubmitting(false);
    }
  }, [publicKey, signTransaction, feeShare, details, metadataUri, initialBuy, connection]);

  const stepIndex = ['details', 'feeshare', 'buy', 'review', 'done'].indexOf(step);

  return (
    <div className="max-w-xl mx-auto">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {['Details', 'Fee Share', 'Initial Buy', 'Review', 'Done'].map((label, i) => (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono ${
                i <= stepIndex
                  ? 'bg-green text-black'
                  : 'bg-surface-2 text-gray-500 border border-border-subtle'
              }`}
            >
              {i + 1}
            </div>
            <span className={`text-[10px] hidden sm:block ${i <= stepIndex ? 'text-green' : 'text-gray-600'}`}>
              {label}
            </span>
            {i < 4 && <div className={`h-px flex-1 ${i < stepIndex ? 'bg-green/50' : 'bg-border-subtle'}`} />}
          </div>
        ))}
      </div>

      {/* Step: Details */}
      {step === 'details' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <h2 className="text-lg font-display font-bold">Token Details</h2>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Token Image</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm text-gray-400" />
            {details.image && (
              <img src={details.image} alt="preview" className="w-16 h-16 rounded-full mt-2 border border-border-subtle" />
            )}
          </div>

          {[
            { key: 'name', label: 'Name', placeholder: 'My Token' },
            { key: 'symbol', label: 'Symbol', placeholder: 'MTK' },
            { key: 'description', label: 'Description', placeholder: 'About this token...' },
            { key: 'twitter', label: 'Twitter (optional)', placeholder: '@handle' },
            { key: 'website', label: 'Website (optional)', placeholder: 'https://...' },
          ].map(field => (
            <div key={field.key}>
              <label className="block text-sm text-gray-400 mb-1">{field.label}</label>
              {field.key === 'description' ? (
                <textarea
                  value={details[field.key as keyof TokenDetails]}
                  onChange={e => setDetails(d => ({ ...d, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg bg-surface-2 border border-border-subtle text-white placeholder:text-gray-600 focus:outline-none focus:border-green/50 transition-colors resize-none"
                />
              ) : (
                <input
                  type="text"
                  value={details[field.key as keyof TokenDetails]}
                  onChange={e => setDetails(d => ({ ...d, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-2.5 rounded-lg bg-surface-2 border border-border-subtle text-white placeholder:text-gray-600 focus:outline-none focus:border-green/50 transition-colors"
                />
              )}
            </div>
          ))}

          {error && <p className="text-sm text-red">{error}</p>}

          <button
            onClick={handleUploadMetadata}
            disabled={submitting || !details.name || !details.symbol}
            className="w-full py-3 rounded-lg bg-green text-black font-semibold text-sm hover:bg-green-dark transition-colors disabled:opacity-50"
          >
            {submitting ? 'Uploading...' : 'Next: Fee Share'}
          </button>
        </motion.div>
      )}

      {/* Step: Fee Share */}
      {step === 'feeshare' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <h2 className="text-lg font-display font-bold">Fee Share Config</h2>
          <p className="text-xs text-gray-500">Configure who earns from trading fees. Total must be 10000 bps (100%).</p>

          {feeShare.map((entry, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={entry.wallet}
                onChange={e => updateFeeShare(i, 'wallet', e.target.value)}
                placeholder="Wallet address"
                className="flex-1 px-3 py-2 rounded-lg bg-surface-2 border border-border-subtle text-sm font-mono text-white placeholder:text-gray-600 focus:outline-none focus:border-green/50"
              />
              <input
                type="number"
                value={entry.bps}
                onChange={e => updateFeeShare(i, 'bps', e.target.value)}
                placeholder="BPS"
                className="w-24 px-3 py-2 rounded-lg bg-surface-2 border border-border-subtle text-sm font-mono text-white focus:outline-none focus:border-green/50"
              />
              {feeShare.length > 1 && (
                <button onClick={() => removeFeeShareEntry(i)} className="text-red text-xs px-2">X</button>
              )}
            </div>
          ))}

          <button onClick={addFeeShareEntry} className="text-xs text-green hover:underline">
            + Add claimer
          </button>

          <div className="flex gap-3">
            <button onClick={() => setStep('details')} className="flex-1 py-2.5 rounded-lg bg-surface-2 text-gray-400 text-sm border border-border-subtle hover:text-white transition-colors">
              Back
            </button>
            <button onClick={() => setStep('buy')} className="flex-1 py-2.5 rounded-lg bg-green text-black font-semibold text-sm hover:bg-green-dark transition-colors">
              Next: Initial Buy
            </button>
          </div>
        </motion.div>
      )}

      {/* Step: Initial Buy */}
      {step === 'buy' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <h2 className="text-lg font-display font-bold">Initial Buy</h2>
          <p className="text-xs text-gray-500">Optionally buy tokens with SOL at launch.</p>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Amount (SOL)</label>
            <input
              type="number"
              value={initialBuy}
              onChange={e => setInitialBuy(e.target.value)}
              placeholder="0"
              className="w-full px-4 py-2.5 rounded-lg bg-surface-2 border border-border-subtle text-white font-mono placeholder:text-gray-600 focus:outline-none focus:border-green/50 transition-colors"
            />
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep('feeshare')} className="flex-1 py-2.5 rounded-lg bg-surface-2 text-gray-400 text-sm border border-border-subtle hover:text-white transition-colors">
              Back
            </button>
            <button onClick={() => setStep('review')} className="flex-1 py-2.5 rounded-lg bg-green text-black font-semibold text-sm hover:bg-green-dark transition-colors">
              Review
            </button>
          </div>
        </motion.div>
      )}

      {/* Step: Review */}
      {step === 'review' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <h2 className="text-lg font-display font-bold">Review & Launch</h2>

          <div className="rounded-lg bg-surface-2 border border-border-subtle p-4 space-y-3">
            <div className="flex items-center gap-3">
              {details.image && <img src={details.image} alt="" className="w-10 h-10 rounded-full" />}
              <div>
                <div className="text-sm font-bold text-white">{details.name}</div>
                <div className="text-xs font-mono text-gray-400">${details.symbol}</div>
              </div>
            </div>
            {details.description && <p className="text-xs text-gray-500">{details.description}</p>}
            <div className="text-xs text-gray-500">
              Fee share: {feeShare.filter(e => e.wallet).length} claimer(s)
            </div>
            {parseFloat(initialBuy) > 0 && (
              <div className="text-xs text-gray-500">Initial buy: {initialBuy} SOL</div>
            )}
          </div>

          {error && <p className="text-sm text-red">{error}</p>}

          <div className="flex gap-3">
            <button onClick={() => setStep('buy')} className="flex-1 py-2.5 rounded-lg bg-surface-2 text-gray-400 text-sm border border-border-subtle hover:text-white transition-colors">
              Back
            </button>
            <button
              onClick={handleLaunch}
              disabled={submitting || !publicKey}
              className="flex-1 py-3 rounded-lg bg-green text-black font-semibold text-sm hover:bg-green-dark transition-colors disabled:opacity-50"
            >
              {submitting ? 'Launching...' : !publicKey ? 'Connect Wallet' : 'Launch Token'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Step: Done */}
      {step === 'done' && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
          <div className="text-4xl mb-4">&#x1F680;</div>
          <h2 className="text-xl font-display font-bold mb-2">Token Launched!</h2>
          <p className="text-sm text-gray-400 mb-4">
            Your token has been created successfully.
          </p>
          {txSig && (
            <p className="text-xs font-mono text-gray-500">
              Tx: {txSig.slice(0, 16)}...
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}
