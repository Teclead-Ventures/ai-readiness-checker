import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function DELETE() {
  try {
    const supabase = createServerClient();

    // Delete in order: responses first (has FK to teams), then the rest
    const { error: funnelError } = await supabase
      .from('funnel_events')
      .delete()
      .neq('id', '');

    if (funnelError) {
      console.error('Delete funnel_events error:', funnelError);
      return NextResponse.json({ error: 'Failed to clear funnel events' }, { status: 500 });
    }

    const { error: visitsError } = await supabase
      .from('campaign_visits')
      .delete()
      .neq('id', '');

    if (visitsError) {
      console.error('Delete campaign_visits error:', visitsError);
      return NextResponse.json({ error: 'Failed to clear campaign visits' }, { status: 500 });
    }

    const { error: responsesError } = await supabase
      .from('responses')
      .delete()
      .neq('id', '');

    if (responsesError) {
      console.error('Delete responses error:', responsesError);
      return NextResponse.json({ error: 'Failed to clear responses' }, { status: 500 });
    }

    const { error: teamsError } = await supabase
      .from('teams')
      .delete()
      .neq('id', '');

    if (teamsError) {
      console.error('Delete teams error:', teamsError);
      return NextResponse.json({ error: 'Failed to clear teams' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/admin/reset error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
