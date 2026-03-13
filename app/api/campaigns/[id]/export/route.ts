import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const { id } = await params;

  // Fetch campaign
  const { data: campaign, error: campError } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .single();

  if (campError || !campaign) {
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
  }

  // Fetch eligibility snapshot (populated when campaign is activated)
  const { data: eligibility, error: eligError } = await supabase
    .from('campaign_eligibility')
    .select('*')
    .eq('campaign_id', id)
    .eq('eligible', true)
    .order('score', { ascending: false });

  if (eligError) {
    return NextResponse.json({ error: eligError.message }, { status: 500 });
  }

  const rows = eligibility || [];

  const header = 'wallet,score,tier,eligible,claimed\n';
  const csv = rows
    .map(r => `${r.wallet},${r.score},${r.tier},${r.eligible},${r.claimed}`)
    .join('\n');

  const filename = `${campaign.name.replace(/\s+/g, '-').toLowerCase()}-eligible.csv`;

  return new NextResponse(header + csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
