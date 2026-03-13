'use client';

import { useState, useRef, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

export default function WalletStatus() {
  const { publicKey, connected, disconnect, select, wallets } = useWallet();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="px-4 py-2 rounded-lg bg-green text-black font-semibold text-sm hover:bg-green-dark transition-colors"
      >
        Connect Wallet
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-52 rounded-xl bg-surface-2 border border-border-subtle shadow-lg overflow-hidden z-50">
          {wallets.filter(w => w.readyState === 'Installed').length > 0 ? (
            wallets
              .filter(w => w.readyState === 'Installed')
              .map(w => (
                <button
                  key={w.adapter.name}
                  onClick={() => {
                    select(w.adapter.name);
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-green/10 hover:text-green transition-colors"
                >
                  {w.adapter.icon && (
                    <img src={w.adapter.icon} alt="" className="w-5 h-5 rounded" />
                  )}
                  {w.adapter.name}
                </button>
              ))
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500">
              No wallets detected. Install a Solana wallet to continue.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
