import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

const STEP_ORDER = [
  'landing',
  'survey_start',
  'track_select',
  'profile',
  'pre_assessment',
  'current_usage',
  'mindset',
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

    // Group by step and action
    const stepEnterCount = new Map<string, number>();
    const stepCompleteCount = new Map<string, number>();

    // For median time: track enter/complete timestamps per session+step
    const sessionStepTimes = new Map<string, { enter?: string; complete?: string }>();

    for (const event of allEvents) {
      const key = `${event.session_id}::${event.step}`;

      if (event.action === 'enter') {
        stepEnterCount.set(event.step, (stepEnterCount.get(event.step) || 0) + 1);
        if (!sessionStepTimes.has(key)) sessionStepTimes.set(key, {});
        sessionStepTimes.get(key)!.enter = event.created_at;
      } else if (event.action === 'complete') {
        stepCompleteCount.set(event.step, (stepCompleteCount.get(event.step) || 0) + 1);
        if (!sessionStepTimes.has(key)) sessionStepTimes.set(key, {});
        sessionStepTimes.get(key)!.complete = event.created_at;
      }
    }

    // Calculate median time per step
    const stepDurations = new Map<string, number[]>();
    for (const [key, times] of sessionStepTimes.entries()) {
      if (times.enter && times.complete) {
        const step = key.split('::')[1];
        const enterTime = new Date(times.enter).getTime();
        const completeTime = new Date(times.complete).getTime();
        const durationSec = (completeTime - enterTime) / 1000;
        if (durationSec > 0 && durationSec < 3600) { // filter out unreasonable durations
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

    const steps: FunnelStep[] = STEP_ORDER.map((step) => {
      const entered = stepEnterCount.get(step) || 0;
      const completed = stepCompleteCount.get(step) || 0;
      const dropOffRate = entered > 0
        ? Math.round(((entered - completed) / entered) * 10000) / 100
        : 0;
      const durations = stepDurations.get(step);
      const medianTimeSeconds = durations && durations.length > 0
        ? median(durations)
        : null;

      return { step, entered, completed, dropOffRate, medianTimeSeconds };
    });

    // Overall conversion: first step entered vs last step completed
    const firstStepEntered = steps[0]?.entered || 0;
    const lastStepCompleted = steps[steps.length - 1]?.completed || 0;
    const overallConversion = firstStepEntered > 0
      ? Math.round((lastStepCompleted / firstStepEntered) * 10000) / 100
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
    });
  } catch (err) {
    console.error('GET /api/admin/funnel error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
