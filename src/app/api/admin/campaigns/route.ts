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
  conversionRate: number;
  avgScore: number | null;
  trackDistribution: { dev: number; business: number };
  firstVisit: string | null;
  lastVisit: string | null;
  dailyVisits: DailyCount[];
}

interface CampaignGroup {
  src: string;
  visits: number;
  completions: number;
  conversionRate: number;
  avgScore: number | null;
  trackDistribution: { dev: number; business: number };
  firstVisit: string | null;
  lastVisit: string | null;
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
      .select('src, cid, visited_at');

    if (srcFilter) {
      visitsQuery = visitsQuery.eq('src', srcFilter);
    }

    const { data: visits, error: visitsError } = await visitsQuery;

    if (visitsError) {
      console.error('Campaign visits query error:', visitsError);
      return NextResponse.json({ error: 'Failed to fetch visits' }, { status: 500 });
    }

    // Query responses grouped by campaign_src (include scores and track for analytics)
    let responsesQuery = supabase
      .from('responses')
      .select('campaign_src, campaign_cid, created_at, scores, track');

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

      // Campaign-level avg score and track distribution
      const scoredResponses = srcResponses.filter((r) => r.scores?.overall !== undefined);
      const avgScore = scoredResponses.length > 0
        ? Math.round(scoredResponses.reduce((s, r) => s + (r.scores?.overall ?? 0), 0) / scoredResponses.length)
        : null;
      const trackDist = { dev: 0, business: 0 };
      for (const r of srcResponses) {
        if (r.track === 'dev') trackDist.dev++;
        else if (r.track === 'business') trackDist.business++;
      }

      // First/last visit timestamps
      const visitDates = srcVisits
        .map((v) => v.visited_at)
        .filter(Boolean)
        .sort();
      const firstVisit = visitDates.length > 0 ? visitDates[0] : null;
      const lastVisit = visitDates.length > 0 ? visitDates[visitDates.length - 1] : null;

      // Daily visits
      const dailyVisitsMap = new Map<string, number>();
      for (const v of srcVisits) {
        const date = v.visited_at?.slice(0, 10) || 'unknown';
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

      // Per-card breakdown with enriched metrics
      const cardVisitsMap = new Map<string, typeof srcVisits>();
      for (const v of srcVisits) {
        const cid = v.cid || 'none';
        if (!cardVisitsMap.has(cid)) cardVisitsMap.set(cid, []);
        cardVisitsMap.get(cid)!.push(v);
      }
      const cardResponsesMap = new Map<string, typeof srcResponses>();
      for (const r of srcResponses) {
        const cid = r.campaign_cid || 'none';
        if (!cardResponsesMap.has(cid)) cardResponsesMap.set(cid, []);
        cardResponsesMap.get(cid)!.push(r);
      }

      const allCids = new Set([...cardVisitsMap.keys(), ...cardResponsesMap.keys()]);
      const topCards: CardBreakdown[] = Array.from(allCids).map((cid) => {
        const cidVisits = cardVisitsMap.get(cid) || [];
        const cidResponses = cardResponsesMap.get(cid) || [];
        const cidVisitCount = cidVisits.length;
        const cidCompletionCount = cidResponses.length;

        const cidScored = cidResponses.filter((r) => r.scores?.overall !== undefined);
        const cidAvgScore = cidScored.length > 0
          ? Math.round(cidScored.reduce((s, r) => s + (r.scores?.overall ?? 0), 0) / cidScored.length)
          : null;

        const cidTrackDist = { dev: 0, business: 0 };
        for (const r of cidResponses) {
          if (r.track === 'dev') cidTrackDist.dev++;
          else if (r.track === 'business') cidTrackDist.business++;
        }

        const cidVisitDates = cidVisits.map((v) => v.visited_at).filter(Boolean).sort();

        // Daily visits per card
        const cidDailyMap = new Map<string, number>();
        for (const v of cidVisits) {
          const date = v.visited_at?.slice(0, 10) || 'unknown';
          cidDailyMap.set(date, (cidDailyMap.get(date) || 0) + 1);
        }
        const cidDailyVisits: DailyCount[] = Array.from(cidDailyMap.entries())
          .map(([date, count]) => ({ date, count }))
          .sort((a, b) => a.date.localeCompare(b.date));

        return {
          cid,
          visits: cidVisitCount,
          completions: cidCompletionCount,
          conversionRate: cidVisitCount > 0
            ? Math.round((cidCompletionCount / cidVisitCount) * 10000) / 100
            : 0,
          avgScore: cidAvgScore,
          trackDistribution: cidTrackDist,
          dailyVisits: cidDailyVisits,
          firstVisit: cidVisitDates.length > 0 ? cidVisitDates[0] : null,
          lastVisit: cidVisitDates.length > 0 ? cidVisitDates[cidVisitDates.length - 1] : null,
        };
      }).sort((a, b) => b.visits - a.visits);

      groups.push({
        src,
        visits: visitCount,
        completions: completionCount,
        conversionRate,
        avgScore,
        trackDistribution: trackDist,
        firstVisit,
        lastVisit,
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
