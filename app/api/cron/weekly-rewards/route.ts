import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { getVault } from '@/lib/rewards';
import { createEpoch } from '@/lib/rewards';

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getServiceSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const { data: vaults, error } = await supabase.from('reward_vaults').select('mint_address');
  if (error || !vaults) {
    return NextResponse.json({ error: 'Failed to fetch reward vaults' }, { status: 500 });
  }

  const results: Array<{ mint: string; epoch?: unknown; error?: string }> = [];

  for (const entry of vaults) {
    const mint = entry.mint_address;
    try {
      const vault = await getVault(mint);
      if (!vault) {
        results.push({ mint, error: 'Vault not found' });
        continue;
      }

      // Get vault SOL balance via RPC
      const rpcUrl = process.env.HELIUS_API_KEY
        ? `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`
        : 'https://api.mainnet-beta.solana.com';

      const balanceRes = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getBalance',
          params: [vault.vault_wallet],
        }),
      });
      const balanceJson = await balanceRes.json();
      const vaultBalance = balanceJson.result?.value || 0;

      if (vaultBalance === 0) {
        results.push({ mint, error: 'Vault balance is 0' });
        continue;
      }

      const epoch = await createEpoch(mint, vaultBalance);
      results.push({ mint, epoch });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      results.push({ mint, error: message });
    }
  }

  return NextResponse.json({ results });
}
