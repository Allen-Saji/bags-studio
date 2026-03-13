import { NextRequest, NextResponse } from 'next/server';
import { BAGS_API_BASE, BAGS_ENDPOINTS } from '@/lib/constants';
import { computeConvictionScores } from '@/lib/conviction';
import { ClaimEvent, BagsApiResponse, ClaimEventsResponse, TokenHolder } from '@/lib/types';
import { getCachedScores, cacheScores } from '@/lib/score-cache';

function getHeliusRpc(): string {
  const key = process.env.HELIUS_API_KEY;
  if (key) return `https://mainnet.helius-rpc.com/?api-key=${key}`;
  return 'https://api.mainnet-beta.solana.com';
}

/** Fetch all token holders via Helius DAS getTokenAccounts (paginated with cursor) */
async function fetchHolders(mint: string): Promise<{ holders: TokenHolder[]; decimals: number }> {
  const rpc = getHeliusRpc();
  const holders: TokenHolder[] = [];
  let cursor: string | undefined;
  let decimals = 9;

  // Get decimals from getAsset
  const assetRes = await fetch(rpc, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'getAsset',
      params: { id: mint },
    }),
  });
  const assetJson = await assetRes.json();
  if (assetJson.result?.token_info?.decimals !== undefined) {
    decimals = assetJson.result.token_info.decimals;
  }

  // Paginate token accounts
  while (true) {
    const params: Record<string, unknown> = {
      mint: mint,
      limit: 1000,
    };
    if (cursor) params.cursor = cursor;

    const res = await fetch(rpc, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getTokenAccounts',
        params,
      }),
    });

    const json = await res.json();
    const result = json.result;
    if (!result?.token_accounts) break;

    for (const acc of result.token_accounts) {
      if (acc.amount > 0) {
        holders.push({
          wallet: acc.owner,
          balance: acc.amount,
          tokenAccount: acc.address,
        });
      }
    }

    if (!result.cursor || result.token_accounts.length < 1000) break;
    cursor = result.cursor;

    // Safety cap at 10k holders
    if (holders.length >= 10000) break;
  }

  return { holders, decimals };
}

/** Fetch all claim events from Bags API */
async function fetchClaimEvents(mint: string, apiKey: string): Promise<ClaimEvent[]> {
  const allEvents: ClaimEvent[] = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const url = `${BAGS_API_BASE}${BAGS_ENDPOINTS.CLAIM_EVENTS}?tokenMint=${mint}&mode=offset&offset=${offset}&limit=${limit}`;
    const res = await fetch(url, {
      headers: { 'x-api-key': apiKey },
    });

    if (!res.ok) break;

    const json: BagsApiResponse<ClaimEventsResponse> = await res.json();
    if (!json.success) break;

    const events = json.response.events || [];
    allEvents.push(...events);

    if (events.length < limit) break;
    offset += limit;
    if (offset > 5000) break;
  }

  return allEvents;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ mint: string }> }
) {
  const { mint } = await params;
  const forceRefresh = request.nextUrl.searchParams.get('refresh') === '1';

  // Try cache first (unless forced refresh)
  if (!forceRefresh) {
    const cached = await getCachedScores(mint);
    if (cached) {
      const wallet = request.nextUrl.searchParams.get('wallet');
      if (wallet) {
        const walletScore = cached.find(s => s.wallet === wallet);
        const rank = walletScore ? cached.indexOf(walletScore) + 1 : -1;
        return NextResponse.json({
          wallet: walletScore || null,
          rank,
          totalSupporters: cached.length,
          cached: true,
        });
      }
      return NextResponse.json({
        scores: cached,
        totalSupporters: cached.length,
        cached: true,
      });
    }
  }

  const apiKey = process.env.BAGS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    // Fetch holders and claim events in parallel
    const [{ holders, decimals }, claimEvents] = await Promise.all([
      fetchHolders(mint),
      fetchClaimEvents(mint, apiKey),
    ]);

    const scores = computeConvictionScores(holders, claimEvents, decimals);

    // Cache the computed scores (fire and forget)
    cacheScores(mint, scores).catch(err =>
      console.error('Failed to cache scores:', err)
    );

    const wallet = request.nextUrl.searchParams.get('wallet');
    if (wallet) {
      const walletScore = scores.find(s => s.wallet === wallet);
      const rank = walletScore ? scores.indexOf(walletScore) + 1 : -1;
      return NextResponse.json({
        wallet: walletScore || null,
        rank,
        totalSupporters: scores.length,
        cached: false,
      });
    }

    return NextResponse.json({
      scores,
      totalSupporters: scores.length,
      totalHolders: holders.length,
      totalClaimEvents: claimEvents.length,
      cached: false,
    });
  } catch (err) {
    console.error('Score computation error:', err);
    return NextResponse.json({ error: 'Failed to compute scores' }, { status: 500 });
  }
}
