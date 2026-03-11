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

    return NextResponse.json({
      totalResponses,
      totalTeams,
      avgScore,
      trackDistribution: {
        dev: devCount,
        business: businessCount,
      },
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
