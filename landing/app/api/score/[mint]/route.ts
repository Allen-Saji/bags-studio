import { NextRequest, NextResponse } from 'next/server';
import { BAGS_API_BASE } from '@/lib/constants';
import { computeConvictionScores } from '@/lib/conviction';
import { ClaimEvent } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ mint: string }> }
) {
  const { mint } = await params;
  const apiKey = process.env.BAGS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    // Paginate all claim events
    const allEvents: ClaimEvent[] = [];
    let page = 1;
    const pageSize = 100;

    while (true) {
      const url = `${BAGS_API_BASE}/fee-share/token/claim-events?tokenMint=${mint}&page=${page}&pageSize=${pageSize}`;
      const res = await fetch(url, {
        headers: { 'x-api-key': apiKey },
        next: { revalidate: 60 },
      });

      if (!res.ok) {
        return NextResponse.json(
          { error: `Bags API returned ${res.status}` },
          { status: res.status }
        );
      }

      const data = await res.json();
      const events: ClaimEvent[] = data.claimEvents || data || [];
      allEvents.push(...events);

      if (events.length < pageSize || (data.total && allEvents.length >= data.total)) {
        break;
      }
      page++;

      // Safety: cap at 50 pages (5000 events)
      if (page > 50) break;
    }

    const scores = computeConvictionScores(allEvents);

    // Optionally filter by wallet
    const wallet = request.nextUrl.searchParams.get('wallet');
    if (wallet) {
      const walletScore = scores.find(s => s.wallet === wallet);
      const rank = walletScore ? scores.indexOf(walletScore) + 1 : -1;
      return NextResponse.json({
        wallet: walletScore || null,
        rank,
        totalSupporters: scores.length,
      });
    }

    return NextResponse.json({
      scores,
      totalSupporters: scores.length,
      totalEvents: allEvents.length,
    });
  } catch (err) {
    console.error('Score computation error:', err);
    return NextResponse.json({ error: 'Failed to compute scores' }, { status: 500 });
  }
}
