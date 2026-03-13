import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, getServiceSupabase } from '@/lib/supabase';
import { validateCampaignInput } from '@/lib/validation';
import { verifyTokenOwner } from '@/lib/verify-ownership';

export async function GET(request: NextRequest) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const mint = request.nextUrl.searchParams.get('mint');
  const wallet = request.nextUrl.searchParams.get('wallet');

  let query = supabase.from('campaigns').select('*').order('created_at', { ascending: false });

  if (mint) query = query.eq('mint_address', mint);
  if (wallet) query = query.eq('creator_wallet', wallet);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Validate input
  const { valid, errors } = validateCampaignInput(body);
  if (!valid) {
    return NextResponse.json({ error: 'Validation failed', errors }, { status: 400 });
  }

  // Verify wallet owns the token
  const isOwner = await verifyTokenOwner(
    body.mint_address as string,
    body.creator_wallet as string
  );
  if (!isOwner) {
    return NextResponse.json(
      { error: 'Wallet is not the creator of this token' },
      { status: 403 }
    );
  }

  // Use service key for writes (RLS only allows public reads)
  const serviceSupabase = getServiceSupabase();
  if (!serviceSupabase) {
    return NextResponse.json({ error: 'Service key not configured' }, { status: 503 });
  }

  const { data, error } = await serviceSupabase
    .from('campaigns')
    .insert({
      mint_address: body.mint_address,
      creator_wallet: body.creator_wallet,
      name: (body.name as string).trim(),
      type: body.type,
      description: body.description || null,
      tier_threshold: body.tier_threshold,
      max_wallets: body.max_wallets || null,
      status: 'draft',
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
