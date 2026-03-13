import { NextRequest, NextResponse } from 'next/server';
import { createEpoch } from '@/lib/rewards';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ mint: string }> }
) {
  const { mint } = await params;

  let body: { vault_balance_lamports: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.vault_balance_lamports) {
    return NextResponse.json({ error: 'vault_balance_lamports is required' }, { status: 400 });
  }

  try {
    const epoch = await createEpoch(mint, body.vault_balance_lamports);
    return NextResponse.json(epoch, { status: 201 });
  } catch (err) {
    console.error('Create epoch error:', err);
    return NextResponse.json({ error: 'Failed to create epoch' }, { status: 500 });
  }
}
