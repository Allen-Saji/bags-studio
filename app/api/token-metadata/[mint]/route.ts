import { NextRequest, NextResponse } from 'next/server';

function getSolanaRpc(): string {
  const key = process.env.HELIUS_API_KEY;
  if (key) return `https://mainnet.helius-rpc.com/?api-key=${key}`;
  return 'https://api.mainnet-beta.solana.com';
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ mint: string }> }
) {
  const { mint } = await params;

  try {
    const res = await fetch(getSolanaRpc(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getAsset',
        params: { id: mint },
      }),
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    const json = await res.json();
    const result = json.result;

    if (!result) {
      return NextResponse.json({ error: 'Token not found' }, { status: 404 });
    }

    const metadata = result.content?.metadata || {};
    const links = result.content?.links || {};
    const files = result.content?.files || [];

    return NextResponse.json({
      mint,
      name: metadata.name || '',
      symbol: metadata.symbol || '',
      description: metadata.description || '',
      image: links.image || files[0]?.uri || '',
    });
  } catch (err) {
    console.error('Token metadata fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch metadata' }, { status: 500 });
  }
}
