import {
  BagsApiResponse,
  TokenCreator,
  TokenClaimStat,
  TokenMetadata,
  FeeShareInfo,
  ClaimEvent,
  ClaimEventsResponse,
  AdminListResponse,
  PoolInfo,
} from './types';
import { BAGS_ENDPOINTS } from './constants';

const API_BASE = '/api/bags';

async function apiFetch<T>(path: string, query?: Record<string, string>): Promise<T> {
  const params = query ? '?' + new URLSearchParams(query).toString() : '';
  const res = await fetch(`${API_BASE}${path}${params}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Bags API error ${res.status}: ${text}`);
  }
  const json: BagsApiResponse<T> = await res.json();
  if (!json.success) {
    throw new Error(json.error || 'Bags API returned an error');
  }
  return json.response;
}

export async function getTokenCreators(mint: string): Promise<TokenCreator[]> {
  return apiFetch<TokenCreator[]>(BAGS_ENDPOINTS.TOKEN_CREATORS, { tokenMint: mint });
}

export async function getTokenClaimStats(mint: string): Promise<TokenClaimStat[]> {
  return apiFetch<TokenClaimStat[]>(BAGS_ENDPOINTS.TOKEN_CLAIM_STATS, { tokenMint: mint });
}

export async function getTokenMetadata(mint: string): Promise<TokenMetadata> {
  const creators = await getTokenCreators(mint);
  const creator = creators.find(c => c.isCreator);

  return {
    mint,
    name: creator?.bagsUsername || creator?.username || mint.slice(0, 8),
    symbol: creator?.bagsUsername?.toUpperCase().slice(0, 6) || '',
    image: creator?.pfp || '',
    creator: creator?.wallet,
    creators,
  };
}

export async function getFeeShareInfo(mint: string): Promise<FeeShareInfo> {
  const [feesResult, claimStats] = await Promise.all([
    apiFetch<string>(BAGS_ENDPOINTS.TOKEN_LIFETIME_FEES, { tokenMint: mint }),
    getTokenClaimStats(mint),
  ]);

  const totalClaimedLamports = claimStats.reduce((sum, s) => sum + parseFloat(s.totalClaimed || '0'), 0);

  return {
    totalFeesLamports: feesResult,
    claimStats,
    uniqueClaimers: claimStats.length,
    totalClaimedLamports,
  };
}

export async function getPoolInfo(mint: string): Promise<PoolInfo> {
  return apiFetch<PoolInfo>(BAGS_ENDPOINTS.POOL_BY_MINT, { tokenMint: mint });
}

export async function getClaimEvents(
  mint: string,
  offset = 0,
  limit = 100
): Promise<ClaimEventsResponse> {
  return apiFetch<ClaimEventsResponse>(BAGS_ENDPOINTS.CLAIM_EVENTS, {
    tokenMint: mint,
    mode: 'offset',
    offset: String(offset),
    limit: String(limit),
  });
}

export async function getAllClaimEvents(mint: string): Promise<ClaimEvent[]> {
  const allEvents: ClaimEvent[] = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const res = await getClaimEvents(mint, offset, limit);
    allEvents.push(...res.events);
    if (res.events.length < limit) break;
    offset += limit;
    if (offset > 5000) break; // Safety cap
  }

  return allEvents;
}

export async function getAdminTokens(wallet: string): Promise<string[]> {
  const data = await apiFetch<AdminListResponse>(BAGS_ENDPOINTS.ADMIN_LIST, { wallet });
  return data.tokenMints;
}
