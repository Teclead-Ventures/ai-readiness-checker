import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

interface DailyCount {
  date: string;
  count: number;
}

interface CardBreakdown {
  cid: string;
  visits: number;
  completions: number;
}

interface CampaignGroup {
  src: string;
  visits: number;
  completions: number;
  conversionRate: number;
  dailyVisits: DailyCount[];
  dailyCompletions: DailyCount[];
  topCards: CardBreakdown[];
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const srcFilter = searchParams.get('src');

    // Query campaign_visits grouped by src and date
    let visitsQuery = supabase
      .from('campaign_visits')
      .select('src, cid, created_at');

    if (srcFilter) {
      visitsQuery = visitsQuery.eq('src', srcFilter);
    }

    const { data: visits, error: visitsError } = await visitsQuery;

    if (visitsError) {
      console.error('Campaign visits query error:', visitsError);
      return NextResponse.json({ error: 'Failed to fetch visits' }, { status: 500 });
    }

    // Query responses grouped by campaign_src
    let responsesQuery = supabase
      .from('responses')
      .select('campaign_src, campaign_cid, created_at');

    if (srcFilter) {
      responsesQuery = responsesQuery.eq('campaign_src', srcFilter);
    }

    const { data: responses, error: responsesError } = await responsesQuery;

    if (responsesError) {
      console.error('Campaign responses query error:', responsesError);
      return NextResponse.json({ error: 'Failed to fetch responses' }, { status: 500 });
    }

    const allVisits = visits || [];
    const allResponses = responses || [];

    // Group visits by src
    const visitsBySrc = new Map<string, typeof allVisits>();
    for (const v of allVisits) {
      const src = v.src || 'direct';
      if (!visitsBySrc.has(src)) visitsBySrc.set(src, []);
      visitsBySrc.get(src)!.push(v);
    }

    // Group responses by campaign_src
    const responsesBySrc = new Map<string, typeof allResponses>();
    for (const r of allResponses) {
      const src = r.campaign_src || 'direct';
      if (!responsesBySrc.has(src)) responsesBySrc.set(src, []);
      responsesBySrc.get(src)!.push(r);
    }

    // Collect all src keys
    const allSrcs = new Set([...visitsBySrc.keys(), ...responsesBySrc.keys()]);

    const groups: CampaignGroup[] = [];

    for (const src of allSrcs) {
      const srcVisits = visitsBySrc.get(src) || [];
      const srcResponses = responsesBySrc.get(src) || [];

      const visitCount = srcVisits.length;
      const completionCount = srcResponses.length;
      const conversionRate = visitCount > 0
        ? Math.round((completionCount / visitCount) * 10000) / 100
        : 0;

      // Daily visits
      const dailyVisitsMap = new Map<string, number>();
      for (const v of srcVisits) {
        const date = v.created_at?.slice(0, 10) || 'unknown';
        dailyVisitsMap.set(date, (dailyVisitsMap.get(date) || 0) + 1);
      }
      const dailyVisits: DailyCount[] = Array.from(dailyVisitsMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Daily completions
      const dailyCompletionsMap = new Map<string, number>();
      for (const r of srcResponses) {
        const date = r.created_at?.slice(0, 10) || 'unknown';
        dailyCompletionsMap.set(date, (dailyCompletionsMap.get(date) || 0) + 1);
      }
      const dailyCompletions: DailyCount[] = Array.from(dailyCompletionsMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Per-card breakdown (only if drill-down or always include top cards)
      const cardVisitsMap = new Map<string, number>();
      for (const v of srcVisits) {
        const cid = v.cid || 'none';
        cardVisitsMap.set(cid, (cardVisitsMap.get(cid) || 0) + 1);
      }
      const cardCompletionsMap = new Map<string, number>();
      for (const r of srcResponses) {
        const cid = r.campaign_cid || 'none';
        cardCompletionsMap.set(cid, (cardCompletionsMap.get(cid) || 0) + 1);
      }
      const allCids = new Set([...cardVisitsMap.keys(), ...cardCompletionsMap.keys()]);
      const topCards: CardBreakdown[] = Array.from(allCids).map((cid) => ({
        cid,
        visits: cardVisitsMap.get(cid) || 0,
        completions: cardCompletionsMap.get(cid) || 0,
      })).sort((a, b) => b.visits - a.visits);

      groups.push({
        src,
        visits: visitCount,
        completions: completionCount,
        conversionRate,
        dailyVisits,
        dailyCompletions,
        topCards,
      });
    }

    // Sort groups by visits descending
    groups.sort((a, b) => b.visits - a.visits);

    return NextResponse.json({ groups });
  } catch (err) {
    console.error('GET /api/admin/campaigns error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
