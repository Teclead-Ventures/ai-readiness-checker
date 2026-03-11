import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { createServerClient } from '@/lib/supabase/server';

const visitSchema = z.object({
  src: z.string(),
  cid: z.string().optional(),
  path: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = visitSchema.parse(body);

    const id = nanoid(12);
    const supabase = createServerClient();

    const { error } = await supabase.from('campaign_visits').insert({
      id,
      ...parsed,
    });

    if (error) {
      console.error('Campaign visit insert error:', error);
      return NextResponse.json({ error: 'Failed to record visit' }, { status: 500 });
    }

    return NextResponse.json({ id });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: err.issues }, { status: 400 });
    }
    console.error('POST /api/campaign/visits error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
