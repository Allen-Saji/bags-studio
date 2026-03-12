import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

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

  const body = await request.json();

  const { data, error } = await supabase
    .from('campaigns')
    .insert({
      mint_address: body.mint_address,
      creator_wallet: body.creator_wallet,
      name: body.name,
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
