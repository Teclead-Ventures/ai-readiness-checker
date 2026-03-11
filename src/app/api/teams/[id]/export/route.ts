import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { SurveyResponse } from '@/types/survey';
import { getFeaturesForTrack } from '@/lib/scoring';

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

    // Collect all category keys across all responses
    const allCategoryKeys = new Set<string>();
    typedResponses.forEach((r) => {
      Object.keys(r.scores.categories).forEach((k) => allCategoryKeys.add(k));
    });
    const sortedCategories = Array.from(allCategoryKeys).sort();

    // Build category header labels
    const categoryHeaders = sortedCategories.map((key) => {
      // Try to get a nice name from dev features first, then business
      const devFeatures = getFeaturesForTrack('dev');
      const bizFeatures = getFeaturesForTrack('business');
      const name = devFeatures[key]?.name?.en || bizFeatures[key]?.name?.en || key;
      return `${key}: ${name}`;
    });

    // CSV header
    const headers = [
      'Name',
      'Track',
      'Overall Score',
      ...categoryHeaders,
      'Date',
    ];

    // CSV rows
    const rows = typedResponses.map((r, index) => {
      const name = team.anonymous
        ? `Anonymous #${typedResponses.length - index}`
        : r.respondent_name || `Anonymous #${typedResponses.length - index}`;

      const categoryScores = sortedCategories.map(
        (key) => r.scores.categories[key]?.toString() ?? ''
      );

      return [
        escapeCsv(name),
        r.track,
        r.scores.overall.toString(),
        ...categoryScores,
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
