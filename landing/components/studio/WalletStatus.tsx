'use client';

import { useWallet } from '@solana/wallet-adapter-react';

export default function WalletStatus() {
  const { publicKey, connected, connect, disconnect, select, wallets } = useWallet();

  if (connected && publicKey) {
    const addr = publicKey.toBase58();
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-muted border border-green/20">
          <div className="w-2 h-2 rounded-full bg-green animate-pulse-dot" />
          <span className="text-sm font-mono text-green">
            {addr.slice(0, 4)}...{addr.slice(-4)}
          </span>
        </div>
        <button
          onClick={() => disconnect()}
          className="text-xs text-gray-400 hover:text-white transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => {
        const phantom = wallets.find(w => w.adapter.name === 'Phantom');
        if (phantom) select(phantom.adapter.name);
        connect().catch(() => {});
      }}
      className="px-4 py-2 rounded-lg bg-green text-black font-semibold text-sm hover:bg-green-dark transition-colors"
    >
      Connect Wallet
    </button>
  );
}
