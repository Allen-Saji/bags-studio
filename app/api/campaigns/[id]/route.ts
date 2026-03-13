import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, getServiceSupabase } from '@/lib/supabase';
import { getCachedScores } from '@/lib/score-cache';
import { filterByTier } from '@/lib/conviction';
import { CampaignStatus, ConvictionTier } from '@/lib/types';

const VALID_TRANSITIONS: Record<string, string[]> = {
  draft: ['active', 'cancelled'],
  active: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const { id } = await params;

  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Fetch existing campaign
  const { data: campaign, error: fetchError } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !campaign) {
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
  }

  // Verify ownership
  if (body.creator_wallet && body.creator_wallet !== campaign.creator_wallet) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  // Handle status transitions
  if (body.status && body.status !== campaign.status) {
    const newStatus = body.status as string;
    const allowed = VALID_TRANSITIONS[campaign.status as string] || [];

    if (!allowed.includes(newStatus)) {
      return NextResponse.json(
        { error: `Cannot transition from ${campaign.status} to ${newStatus}` },
        { status: 400 }
      );
    }

    // On activation: snapshot eligible wallets
    if (newStatus === 'active') {
      const serviceSupabase = getServiceSupabase();
      if (serviceSupabase) {
        const scores = await getCachedScores(campaign.mint_address);
        if (scores && scores.length > 0) {
          let eligible = filterByTier(scores, campaign.tier_threshold as ConvictionTier);
          if (campaign.max_wallets) {
            eligible = eligible.slice(0, campaign.max_wallets);
          }

          const rows = eligible.map(s => ({
            campaign_id: id,
            wallet: s.wallet,
            score: s.score,
            tier: s.tier,
            eligible: true,
            claimed: false,
          }));

          if (rows.length > 0) {
            // Clear existing eligibility for this campaign
            await serviceSupabase
              .from('campaign_eligibility')
              .delete()
              .eq('campaign_id', id);

            // Insert in batches
            for (let i = 0; i < rows.length; i += 500) {
              await serviceSupabase
                .from('campaign_eligibility')
                .insert(rows.slice(i, i + 500));
            }
          }
        }
      }
    }
  }

  // Build update object (only allow specific fields)
  const updateFields: Record<string, unknown> = {};
  if (body.status) updateFields.status = body.status;
  if (body.name) updateFields.name = body.name;
  if (body.description !== undefined) updateFields.description = body.description;

  // Use service key for writes (RLS only allows public reads)
  const serviceSupabaseForUpdate = getServiceSupabase();
  if (!serviceSupabaseForUpdate) {
    return NextResponse.json({ error: 'Service key not configured' }, { status: 503 });
  }

  const { data, error } = await serviceSupabaseForUpdate
    .from('campaigns')
    .update(updateFields)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
