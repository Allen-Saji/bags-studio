'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';

export default function AuthStatus() {
  const { data: session, status } = useSession();
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

  if (status === 'loading') {
    return (
      <div className="px-3 py-1.5 rounded-lg bg-surface-2 border border-border-subtle">
        <div className="w-20 h-4 bg-gray-700 animate-pulse rounded" />
      </div>
    );
  }

  if (session?.user) {
    const { providerUsername, provider, avatar, wallet } = session.user;

    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-lg bg-green-muted border border-green/20 hover:border-green/40 transition-colors"
        >
          {avatar && (
            <img src={avatar} alt="" className="w-5 h-5 rounded-full" />
          )}
          <span className="text-xs sm:text-sm font-mono text-green max-w-[120px] truncate">
            {provider === 'twitter' ? '@' : ''}{providerUsername}
          </span>
          <div className="w-2 h-2 rounded-full bg-green animate-pulse-dot" />
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-64 rounded-xl bg-surface-2 border border-border-subtle shadow-lg overflow-hidden z-50">
            <div className="px-4 py-3 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                {avatar && <img src={avatar} alt="" className="w-8 h-8 rounded-full" />}
                <div>
                  <p className="text-sm font-medium text-white">
                    {provider === 'twitter' ? '@' : ''}{providerUsername}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{provider}</p>
                </div>
              </div>
              {wallet && (
                <p className="mt-2 text-xs font-mono text-gray-400 truncate" title={wallet}>
                  Wallet: {wallet.slice(0, 4)}...{wallet.slice(-4)}
                </p>
              )}
              {!wallet && (
                <p className="mt-2 text-xs text-yellow-500/80">
                  No Bags wallet linked
                </p>
              )}
            </div>
            <button
              onClick={() => {
                signOut({ callbackUrl: '/' });
                setShowDropdown(false);
              }}
              className="w-full px-4 py-2.5 text-left text-sm text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => signIn(undefined, { callbackUrl: window.location.pathname })}
        className="px-3 sm:px-4 py-2 rounded-lg bg-green text-black font-semibold text-xs sm:text-sm hover:bg-green-dark transition-colors"
      >
        Sign in
      </button>
    </div>
  );
}
