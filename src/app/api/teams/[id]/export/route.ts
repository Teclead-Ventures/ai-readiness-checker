import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { SurveyResponse } from '@/types/survey';
import { TIER_CONFIG } from '@/lib/features/types';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServerClient();

    // Fetch team
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('*')
      .eq('id', id)
      .single();

    if (teamError || !team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Fetch responses
    const { data: responses, error: responsesError } = await supabase
      .from('responses')
      .select('*')
      .eq('team_id', id)
      .order('created_at', { ascending: false });

    if (responsesError) {
      return NextResponse.json({ error: 'Failed to fetch responses' }, { status: 500 });
    }

    const typedResponses = (responses || []) as SurveyResponse[];

    // Build tier headers
    const tiers = [1, 2, 3, 4, 5] as const;
    const tierHeaders = tiers.map(
      (tier) => `T${tier}: ${TIER_CONFIG[tier].en}`
    );

    // CSV header
    const headers = [
      'Name',
      'Track',
      'Overall Score',
      ...tierHeaders,
      'Timeline Position',
      'Gap (Months)',
      'Direction',
      'Date',
    ];

    // CSV rows
    const rows = typedResponses.map((r, index) => {
      const name = team.anonymous
        ? `Anonymous #${typedResponses.length - index}`
        : r.respondent_name || `Anonymous #${typedResponses.length - index}`;

      const tierScores = tiers.map(
        (tier) => (r.scores.tiers[tier] ?? '').toString()
      );

      const timelinePosition = r.scores.timeline?.timelinePositionLabel ?? '';
      const gapMonths = r.scores.timeline?.gapMonths?.toString() ?? '';
      const direction = r.scores.adaptation?.direction ?? '';

      return [
        escapeCsv(name),
        r.track,
        r.scores.overall.toString(),
        ...tierScores,
        escapeCsv(timelinePosition),
        gapMonths,
        direction,
        new Date(r.created_at).toISOString().split('T')[0],
      ];
    });

    const csv = [
      headers.map(escapeCsv).join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const filename = `${team.name.replace(/[^a-zA-Z0-9]/g, '-')}-results.csv`;

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error('Export error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
