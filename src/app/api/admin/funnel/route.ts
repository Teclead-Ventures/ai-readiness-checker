import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

// Must match the actual events fired by useFunnelTracking + SurveyForm + page.tsx
// landing:          enter on page.tsx mount, complete on CTA click
// survey_start:     enter on SurveyForm mount (no complete — transition fires track_select complete)
// track_select…free_text: enter/complete via STEP_IDS transitions in SurveyForm
// submit:           complete only, fired on form submission
// results_view:     enter only, fired on results page
const STEP_ORDER = [
  'landing',
  'survey_start',
  'track_select',
  'profile',
  'pre_assessment',
  'current_usage',
  'mindset',
  'knowledge_management',
  'feature_matrix',
  'post_assessment',
  'free_text',
  'submit',
  'results_view',
];

interface FunnelStep {
  step: string;
  entered: number;
  completed: number;
  dropOffRate: number;
  medianTimeSeconds: number | null;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const srcFilter = searchParams.get('src');
    const fromDate = searchParams.get('from');
    const toDate = searchParams.get('to');

    // Fetch available filter options (distinct src values)
    const { data: allEventsForFilters } = await supabase
      .from('funnel_events')
      .select('src');

    const availableSources = Array.from(
      new Set((allEventsForFilters || []).map((e) => e.src).filter(Boolean))
    ).sort();

    let query = supabase
      .from('funnel_events')
      .select('session_id, step, action, created_at, src');

    if (srcFilter) {
      query = query.eq('src', srcFilter);
    }
    if (fromDate) {
      query = query.gte('created_at', `${fromDate}T00:00:00.000Z`);
    }
    if (toDate) {
      query = query.lte('created_at', `${toDate}T23:59:59.999Z`);
    }

    const { data: events, error } = await query;

    if (error) {
      console.error('Funnel events query error:', error);
      return NextResponse.json({ error: 'Failed to fetch funnel events' }, { status: 500 });
    }

    const allEvents = events || [];

    // ── Count unique sessions that reached each step ──
    // A session "reached" a step if it has ANY event (enter or complete) for it.
    // This avoids issues with steps that only fire enter or only fire complete.
    const stepSessions = new Map<string, Set<string>>();
    // For median time: track enter/complete timestamps per session+step
    const sessionStepTimes = new Map<string, { enter?: string; complete?: string }>();

    for (const event of allEvents) {
      const { step, session_id, action, created_at } = event;

      // Track unique sessions per step
      if (!stepSessions.has(step)) stepSessions.set(step, new Set());
      stepSessions.get(step)!.add(session_id);

      // Track timestamps for median time calculation
      const key = `${session_id}::${step}`;
      if (!sessionStepTimes.has(key)) sessionStepTimes.set(key, {});
      if (action === 'enter') {
        sessionStepTimes.get(key)!.enter = created_at;
      } else if (action === 'complete') {
        sessionStepTimes.get(key)!.complete = created_at;
      }
    }

    // ── Median time per step (enter → complete within same session) ──
    const stepDurations = new Map<string, number[]>();
    for (const [key, times] of sessionStepTimes.entries()) {
      if (times.enter && times.complete) {
        const step = key.split('::')[1];
        const durationSec = (new Date(times.complete).getTime() - new Date(times.enter).getTime()) / 1000;
        if (durationSec > 0 && durationSec < 3600) {
          if (!stepDurations.has(step)) stepDurations.set(step, []);
          stepDurations.get(step)!.push(durationSec);
        }
      }
    }

    function median(arr: number[]): number {
      if (arr.length === 0) return 0;
      const sorted = [...arr].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 === 0
        ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
        : Math.round(sorted[mid]);
    }

    // ── Build step metrics ──
    // "reached" = unique sessions that touched this step
    // "drop-off" = % of sessions that reached this step but NOT the next step
    const stepReached: number[] = STEP_ORDER.map(
      (step) => stepSessions.get(step)?.size || 0
    );

    const steps: FunnelStep[] = STEP_ORDER.map((step, i) => {
      const reached = stepReached[i];
      const nextReached = i < STEP_ORDER.length - 1 ? stepReached[i + 1] : reached;
      const dropOffRate = reached > 0
        ? Math.round(((reached - nextReached) / reached) * 10000) / 100
        : 0;
      const durations = stepDurations.get(step);
      const medianTimeSeconds = durations && durations.length > 0
        ? median(durations)
        : null;

      return {
        step,
        entered: reached,
        completed: nextReached,
        dropOffRate: Math.max(0, dropOffRate),
        medianTimeSeconds,
      };
    });

    // Overall conversion: first step reached vs last step reached
    const firstReached = steps.find((s) => s.entered > 0)?.entered || 0;
    const lastReached = [...steps].reverse().find((s) => s.entered > 0)?.entered || 0;
    const overallConversion = firstReached > 0
      ? Math.round((lastReached / firstReached) * 10000) / 100
      : 0;

    // Biggest drop-off
    let biggestDropOff = { step: '', rate: 0 };
    for (const s of steps) {
      if (s.dropOffRate > biggestDropOff.rate) {
        biggestDropOff = { step: s.step, rate: s.dropOffRate };
      }
    }

    return NextResponse.json({
      steps,
      overallConversion,
      biggestDropOff,
      availableSources,
    });
  } catch (err) {
    console.error('GET /api/admin/funnel error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
