import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { computeConvictionScores } from '@/lib/conviction';
import { updateStreaks } from '@/lib/streaks';
import { refreshFullLeaderboard } from '@/lib/points';
import { ConvictionTier, TokenHolder } from '@/lib/types';

function getHeliusRpc(): string {
  const key = process.env.HELIUS_API_KEY;
  if (key) return `https://mainnet.helius-rpc.com/?api-key=${key}`;
  return 'https://api.mainnet-beta.solana.com';
}

async function fetchHolders(mint: string, rpc: string): Promise<TokenHolder[]> {
  const holders: TokenHolder[] = [];
  let cursor: string | undefined;

  while (true) {
    const params: Record<string, unknown> = { mint, limit: 1000 };
    if (cursor) params.cursor = cursor;

    const res = await fetch(rpc, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getTokenAccounts', params }),
    });

    const json = await res.json();
    const result = json.result;
    if (!result?.token_accounts) break;

    for (const acc of result.token_accounts) {
      if (acc.amount > 0) {
        holders.push({ wallet: acc.owner, balance: acc.amount, tokenAccount: acc.address });
      }
    }

    if (!result.cursor || result.token_accounts.length < 1000) break;
    cursor = result.cursor;
    if (holders.length >= 10000) break;
  }

  return holders;
}

async function handler(request: NextRequest) {
  // Vercel cron sends GET with Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getServiceSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const { data: coins, error } = await supabase.from('coins').select('mint_address');
  if (error || !coins) {
    return NextResponse.json({ error: 'Failed to fetch coins' }, { status: 500 });
  }

  const rpc = getHeliusRpc();
  const results: Array<{ mint: string; holders: number; streaks: unknown; error?: string }> = [];

  for (const coin of coins) {
    const mint = coin.mint_address;
    try {
      // Fetch holders
      const holders = await fetchHolders(mint, rpc);

      // Compute scores to get tier map
      const scores = computeConvictionScores(holders, [], 9);
      const tierMap = new Map<string, ConvictionTier>();
      for (const s of scores) {
        tierMap.set(s.wallet, s.tier);
      }

      // Update streaks + award hold/streak points
      const streakResult = await updateStreaks(mint, holders, tierMap);

      // Refresh full leaderboard with decay
      await refreshFullLeaderboard(mint);

      results.push({ mint, holders: holders.length, streaks: streakResult });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      results.push({ mint, holders: 0, streaks: null, error: message });
    }
  }

  return NextResponse.json({ results });
}

export const GET = handler;
export const POST = handler;
