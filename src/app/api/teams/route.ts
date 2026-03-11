import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { createServerClient } from '@/lib/supabase/server';

const createTeamSchema = z.object({
  name: z.string().min(1),
  created_by_name: z.string().min(1),
  created_by_email: z.string().email().optional(),
  track_preset: z.enum(['both', 'dev', 'business']).default('both'),
  anonymous: z.boolean().default(false),
  language: z.string().default('en'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createTeamSchema.parse(body);

    const id = nanoid(12);
    const supabase = createServerClient();

    const teamData = {
      id,
      ...parsed,
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('teams').insert(teamData);

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: 'Failed to create team' }, { status: 500 });
    }

    return NextResponse.json(teamData, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: err.issues }, { status: 400 });
    }
    console.error('Create team error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('List teams error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
