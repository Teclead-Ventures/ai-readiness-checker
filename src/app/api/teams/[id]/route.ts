import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

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

    // Fetch all responses for this team
    const { data: responses, error: responsesError } = await supabase
      .from('responses')
      .select('*')
      .eq('team_id', id)
      .order('created_at', { ascending: false });

    if (responsesError) {
      console.error('Supabase responses error:', responsesError);
      return NextResponse.json({ error: 'Failed to fetch responses' }, { status: 500 });
    }

    return NextResponse.json({ ...team, responses: responses || [] });
  } catch (err) {
    console.error('Get team error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
