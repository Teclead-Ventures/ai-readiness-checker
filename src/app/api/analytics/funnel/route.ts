import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { createServerClient } from '@/lib/supabase/server';

const funnelEventSchema = z.object({
  session_id: z.string(),
  src: z.string().optional(),
  track: z.string().optional(),
  step: z.string(),
  action: z.enum(['enter', 'complete']),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = funnelEventSchema.parse(body);

    const id = nanoid(12);
    const supabase = createServerClient();

    const { error } = await supabase.from('funnel_events').insert({
      id,
      ...parsed,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Funnel event insert error:', error);
      return NextResponse.json({ error: 'Failed to save funnel event' }, { status: 500 });
    }

    return NextResponse.json({ id });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: err.issues }, { status: 400 });
    }
    console.error('POST /api/analytics/funnel error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
