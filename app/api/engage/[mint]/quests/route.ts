import { NextRequest, NextResponse } from 'next/server';
import { getQuests, createQuest } from '@/lib/quests';
import { verifyTokenOwner } from '@/lib/verify-ownership';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ mint: string }> }
) {
  const { mint } = await params;
  const activeOnly = request.nextUrl.searchParams.get('active_only') !== 'false';

  try {
    const quests = await getQuests(mint, activeOnly);
    return NextResponse.json({ quests });
  } catch (err) {
    console.error('Get quests error:', err);
    return NextResponse.json({ error: 'Failed to fetch quests' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ mint: string }> }
) {
  const { mint } = await params;

  let body: {
    creator_wallet: string;
    title: string;
    description?: string;
    quest_type: string;
    points_reward: number;
    target_value?: number;
    requires_approval?: boolean;
    max_completions?: number;
    expires_at?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.creator_wallet || !body.title || !body.quest_type || !body.points_reward) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const isOwner = await verifyTokenOwner(mint, body.creator_wallet);
    if (!isOwner) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const quest = await createQuest(mint, body.creator_wallet, body);
    return NextResponse.json(quest, { status: 201 });
  } catch (err) {
    console.error('Create quest error:', err);
    return NextResponse.json({ error: 'Failed to create quest' }, { status: 500 });
  }
}
