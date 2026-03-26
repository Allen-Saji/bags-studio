import { NextRequest, NextResponse } from 'next/server';
import { getTradeQuote } from '@/lib/bags-wrapper';

// Platform swap fee: 0.25% (25 basis points)
const PLATFORM_FEE_BPS = 25;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const inputMint = searchParams.get('inputMint');
  const outputMint = searchParams.get('outputMint');
  const amount = searchParams.get('amount');
  const slippageBps = searchParams.get('slippageBps') || undefined;

  if (!inputMint || !outputMint || !amount) {
    return NextResponse.json({ error: 'Missing required params: inputMint, outputMint, amount' }, { status: 400 });
  }

  try {
    const quote = await getTradeQuote({ inputMint, outputMint, amount, slippageBps });

    // Calculate platform fee on output amount
    const outAmount = Number(quote.outAmount || quote.outputAmount || 0);
    const platformFee = Math.floor(outAmount * PLATFORM_FEE_BPS / 10000);
    const netOutput = outAmount - platformFee;

    return NextResponse.json({
      ...quote,
      platformFee,
      platformFeeBps: PLATFORM_FEE_BPS,
      netOutput,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to get trade quote';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
