import { NextRequest, NextResponse } from 'next/server';
import { createSwapTransaction } from '@/lib/bags-wrapper';
import { logTrade, resolveTokenMint } from '@/lib/trades';
import { Transaction, PublicKey, SystemProgram } from '@solana/web3.js';
import { requireAuth } from '@/lib/auth-session';

// Platform fee wallet — receives 0.25% swap fees
const PLATFORM_FEE_WALLET = new PublicKey(
  process.env.PLATFORM_FEE_WALLET || '11111111111111111111111111111111'
);
const PLATFORM_FEE_BPS = 25; // 0.25%
const SOL_MINT = 'So11111111111111111111111111111111111111112';

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { inputMint, outputMint, amount, slippageBps, wallet } = body as {
    inputMint: string;
    outputMint: string;
    amount: string;
    slippageBps?: number;
    wallet: string;
  };

  // Require authentication for swaps
  const authResult = await requireAuth();
  if (authResult instanceof Response) return authResult;

  if (!inputMint || !outputMint || !amount || !wallet) {
    return NextResponse.json({ error: 'Missing required fields: inputMint, outputMint, amount, wallet' }, { status: 400 });
  }

  try {
    const response = await createSwapTransaction({ inputMint, outputMint, amount, slippageBps, wallet });

    // Calculate platform fee on input amount (SOL side)
    // Only charge fee when input is SOL (buying tokens) to keep it simple
    let transaction = response.transaction;
    if (inputMint === SOL_MINT && process.env.PLATFORM_FEE_WALLET) {
      try {
        const feeAmount = Math.floor(Number(amount) * PLATFORM_FEE_BPS / 10000);
        if (feeAmount > 0) {
          const tx = Transaction.from(Buffer.from(transaction, 'base64'));
          tx.add(
            SystemProgram.transfer({
              fromPubkey: new PublicKey(wallet),
              toPubkey: PLATFORM_FEE_WALLET,
              lamports: feeAmount,
            })
          );
          transaction = tx.serialize({ requireAllSignatures: false }).toString('base64');
        }
      } catch (feeErr) {
        // If fee injection fails, still return the swap without fee
        console.error('Fee injection error:', feeErr);
      }
    }

    // Log trade for volume tracking (non-blocking)
    const tokenMint = resolveTokenMint(inputMint, outputMint);
    logTrade({
      mint_address: tokenMint,
      wallet,
      input_mint: inputMint,
      output_mint: outputMint,
      amount_in: Number(amount),
      amount_out: 0,
    }).catch(err => console.error('Trade log error:', err));

    return NextResponse.json({ transaction });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create swap transaction';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
