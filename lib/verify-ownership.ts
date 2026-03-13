import { BAGS_API_BASE, BAGS_ENDPOINTS } from './constants';
import { BagsApiResponse, TokenCreator } from './types';

/**
 * Verify that a wallet address is a creator/admin of a token using Bags API.
 */
export async function verifyTokenOwner(mint: string, wallet: string): Promise<boolean> {
  const apiKey = process.env.BAGS_API_KEY;
  if (!apiKey) return false;

  try {
    const url = `${BAGS_API_BASE}${BAGS_ENDPOINTS.TOKEN_CREATORS}?tokenMint=${mint}`;
    const res = await fetch(url, {
      headers: { 'x-api-key': apiKey },
    });

    if (!res.ok) return false;

    const json: BagsApiResponse<TokenCreator[]> = await res.json();
    if (!json.success || !json.response) return false;

    // Check if the wallet is a creator or admin
    return json.response.some(
      c => c.wallet === wallet && (c.isCreator || c.isAdmin)
    );
  } catch {
    return false;
  }
}
