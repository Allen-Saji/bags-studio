'use client';

import { useSession } from 'next-auth/react';
import useSWR from 'swr';

export type TokenRole = 'creator' | 'admin' | 'holder' | 'visitor' | 'loading';

const fetcher = (url: string) => fetch(url).then(r => r.json());

/**
 * Client-side hook to determine the user's role for a specific token.
 *
 * Checks session provider/username against the token's creator list from Bags API.
 * Falls back to wallet-adapter publicKey if no session.
 */
export function useTokenRole(mint: string): {
  role: TokenRole;
  wallet: string | null;
  isCreator: boolean;
  isAdmin: boolean;
} {
  const { data: session, status } = useSession();

  const { data: dashboard } = useSWR(
    mint ? `/api/dashboard/${mint}` : null,
    fetcher,
    { revalidateOnFocus: false },
  );

  if (status === 'loading' || !dashboard) {
    return { role: 'loading', wallet: null, isCreator: false, isAdmin: false };
  }

  const creators: Array<{
    wallet: string;
    provider: string | null;
    providerUsername: string | null;
    twitterUsername: string;
    isCreator: boolean;
    isAdmin: boolean;
  }> = dashboard?.creators || [];

  const provider = session?.user?.provider;
  const providerUsername = session?.user?.providerUsername;
  const sessionWallet = session?.user?.wallet;

  if (provider && providerUsername) {
    const match = creators.find(c => {
      if (c.provider === provider && c.providerUsername?.toLowerCase() === providerUsername.toLowerCase()) {
        return true;
      }
      if (provider === 'twitter' && c.twitterUsername?.toLowerCase() === providerUsername.toLowerCase()) {
        return true;
      }
      if (sessionWallet && c.wallet === sessionWallet) {
        return true;
      }
      return false;
    });

    if (match) {
      const wallet = sessionWallet || match.wallet;
      if (match.isCreator) return { role: 'creator', wallet, isCreator: true, isAdmin: true };
      if (match.isAdmin) return { role: 'admin', wallet, isCreator: false, isAdmin: true };
    }

    // Signed in but not creator/admin
    return { role: sessionWallet ? 'holder' : 'visitor', wallet: sessionWallet || null, isCreator: false, isAdmin: false };
  }

  return { role: 'visitor', wallet: null, isCreator: false, isAdmin: false };
}
