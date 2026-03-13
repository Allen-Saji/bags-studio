import { NextRequest, NextResponse } from 'next/server';
import { getVault } from '@/lib/rewards';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ mint: string }> }
) {
  const { mint } = await params;

  try {
    const vault = await getVault(mint);
    return NextResponse.json(vault);
  } catch (err) {
    console.error('Get vault error:', err);
    return NextResponse.json({ error: 'Failed to fetch vault' }, { status: 500 });
  }
}
