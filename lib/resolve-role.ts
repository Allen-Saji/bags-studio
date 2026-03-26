import { BAGS_API_BASE } from './constants';

export type TokenRole = 'creator' | 'admin' | 'holder' | 'visitor';

interface RoleResult {
  role: TokenRole;
  wallet: string | null;
}

/**
 * Determine the user's role for a specific token.
 *
 * Checks against Bags API creator/v3 endpoint:
 * - If social handle matches a creator → 'creator'
 * - If social handle matches an admin → 'admin'
 * - If wallet holds the token → 'holder'
 * - Otherwise → 'visitor'
 */
export async function resolveTokenRole(
  mint: string,
  provider: string | null,
  providerUsername: string | null,
  wallet: string | null,
): Promise<RoleResult> {
  if (!provider || !providerUsername) {
    return { role: 'visitor', wallet };
  }

  const apiKey = process.env.BAGS_API_KEY;
  if (!apiKey) return { role: 'visitor', wallet };

  try {
    // Fetch creators/admins for this token
    const url = `${BAGS_API_BASE}/token-launch/creator/v3?tokenMint=${encodeURIComponent(mint)}`;
    const res = await fetch(url, {
      headers: { 'x-api-key': apiKey },
    });

    if (!res.ok) return { role: wallet ? 'holder' : 'visitor', wallet };

    const json = await res.json();
    if (!json.success) return { role: wallet ? 'holder' : 'visitor', wallet };

    const creators: Array<{
      wallet: string;
      provider: string | null;
      providerUsername: string | null;
      twitterUsername: string;
      bagsUsername: string;
      isCreator: boolean;
      isAdmin: boolean;
    }> = json.response || [];

    // Match by provider+username or twitterUsername
    const match = creators.find(c => {
      // Direct provider match
      if (c.provider === provider && c.providerUsername?.toLowerCase() === providerUsername.toLowerCase()) {
        return true;
      }
      // Twitter-specific: Bags has explicit twitterUsername field
      if (provider === 'twitter' && c.twitterUsername?.toLowerCase() === providerUsername.toLowerCase()) {
        return true;
      }
      // Wallet match (if user also connected wallet)
      if (wallet && c.wallet === wallet) {
        return true;
      }
      return false;
    });

    if (match) {
      const resolvedWallet = wallet || match.wallet;
      if (match.isCreator) return { role: 'creator', wallet: resolvedWallet };
      if (match.isAdmin) return { role: 'admin', wallet: resolvedWallet };
    }

    // Not a creator/admin — check if they hold the token
    if (wallet) {
      const hasBalance = await checkTokenBalance(wallet, mint);
      if (hasBalance) return { role: 'holder', wallet };
    }

    return { role: 'visitor', wallet };
  } catch {
    return { role: wallet ? 'holder' : 'visitor', wallet };
  }
}

async function checkTokenBalance(wallet: string, mint: string): Promise<boolean> {
  try {
    const heliusKey = process.env.HELIUS_API_KEY;
    const rpcUrl = heliusKey
      ? `https://mainnet.helius-rpc.com/?api-key=${heliusKey}`
      : 'https://api.mainnet-beta.solana.com';

    const res = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getTokenAccountsByOwner',
        params: [
          wallet,
          { mint },
          { encoding: 'jsonParsed' },
        ],
      }),
    });

    const json = await res.json();
    const accounts = json.result?.value || [];
    return accounts.some(
      (a: { account: { data: { parsed: { info: { tokenAmount: { uiAmount: number } } } } } }) =>
        a.account.data.parsed.info.tokenAmount.uiAmount > 0,
    );
  } catch {
    return false;
  }
}
