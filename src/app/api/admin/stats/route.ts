import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createServerClient();

    // Fetch all responses
    const { data: responses, error: responsesError } = await supabase
      .from('responses')
      .select('*');

    if (responsesError) {
      console.error('Supabase responses error:', responsesError);
      return NextResponse.json({ error: 'Failed to fetch responses' }, { status: 500 });
    }

    // Fetch all teams
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('id');

    if (teamsError) {
      console.error('Supabase teams error:', teamsError);
      return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
    }

    const allResponses = responses || [];
    const totalResponses = allResponses.length;
    const totalTeams = (teams || []).length;

    // Average overall score
    const avgScore = totalResponses > 0
      ? Math.round(
          allResponses.reduce((sum: number, r: { scores: { overall: number } }) => sum + (r.scores?.overall ?? 0), 0) / totalResponses
        )
      : 0;

    // Track distribution
    const devCount = allResponses.filter((r: { track: string }) => r.track === 'dev').length;
    const businessCount = allResponses.filter((r: { track: string }) => r.track === 'business').length;

    // Timeline aggregates
    type ResponseWithScores = {
      scores: {
        overall: number;
        timeline?: {
          timelinePosition?: string;
          gapMonths?: number;
        };
        adaptation?: {
          direction?: string;
        };
      };
    };

    const responsesWithTimeline = allResponses.filter(
      (r: ResponseWithScores) => r.scores?.timeline?.gapMonths !== undefined
    ) as ResponseWithScores[];

    const avgTimelineGap = responsesWithTimeline.length > 0
      ? Math.round(
          responsesWithTimeline.reduce(
            (sum, r) => sum + (r.scores.timeline?.gapMonths ?? 0), 0
          ) / responsesWithTimeline.length
        )
      : 0;

    // Average timeline position (as date string, pick the most common or compute average month offset)
    const timelinePositions = responsesWithTimeline
      .map((r) => r.scores.timeline?.timelinePosition)
      .filter(Boolean) as string[];

    const avgTimelinePosition = timelinePositions.length > 0
      ? computeAverageTimelinePosition(timelinePositions)
      : null;

    // Adaptation direction distribution
    const responsesWithAdaptation = allResponses.filter(
      (r: ResponseWithScores) => r.scores?.adaptation?.direction
    ) as ResponseWithScores[];

    const directionCounts = { widening: 0, stable: 0, closing: 0 };
    responsesWithAdaptation.forEach((r) => {
      const dir = r.scores.adaptation?.direction as keyof typeof directionCounts;
      if (dir && dir in directionCounts) {
        directionCounts[dir]++;
      }
    });

    const pctWidening = responsesWithAdaptation.length > 0
      ? Math.round((directionCounts.widening / responsesWithAdaptation.length) * 100)
      : 0;

    return NextResponse.json({
      totalResponses,
      totalTeams,
      avgScore,
      trackDistribution: {
        dev: devCount,
        business: businessCount,
      },
      avgTimelineGap,
      avgTimelinePosition,
      directionCounts,
      pctWidening,
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function computeAverageTimelinePosition(positions: string[]): string {
  // Convert "YYYY-MM" strings to months since epoch, average, convert back
  const months = positions.map((p) => {
    const [y, m] = p.split('-').map(Number);
    return y * 12 + m;
  });
  const avg = Math.round(months.reduce((s, v) => s + v, 0) / months.length);
  const year = Math.floor(avg / 12);
  const month = avg % 12 || 12;
  return `${year}-${String(month).padStart(2, '0')}`;
}
