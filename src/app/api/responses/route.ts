import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { createServerClient } from '@/lib/supabase/server';
import { calculateFullScores } from '@/lib/scoring';
import type { FeatureEntry } from '@/types/survey';

const featureEntrySchema = z.object({
  score: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]).optional(),
  relevant: z.enum(['yes', 'no', 'unsure']).optional(),
});

const surveySchema = z.object({
  track: z.enum(['dev', 'business']),
  respondent_name: z.string().optional().default(''),
  language: z.string().default('en'),
  team_id: z.string().optional(),

  profile: z.object({
    role: z.string(),
    experience_years: z.number(),
    languages: z.array(z.string()).optional(),
    company_size: z.string(),
    industry: z.string().optional(),
  }),

  self_score_before: z.number().min(1).max(10),
  utilization_before: z.number().min(0).max(100),
  confidence_before: z.number().min(1).max(5),

  current_usage: z.object({
    tools: z.array(z.string()),
    modes: z.array(z.string()).optional(),
    frequency: z.string(),
    config_items: z.array(z.string()).optional(),
    usage_contexts: z.array(z.string()).optional(),
  }),

  openness: z.number().min(1).max(5),
  barriers: z.array(z.string()),
  barriers_other: z.string().optional().default(''),
  priority_areas: z.array(z.string()),

  knowledge_management: z.object({
    awareness: z.number().min(1).max(5),
    filtering: z.number().min(1).max(5),
    contextualization: z.number().min(1).max(5),
    overload: z.number().min(1).max(5),
    knowledge_transfer: z.number().min(1).max(5),
  }).optional().default({ awareness: 3, filtering: 3, contextualization: 3, overload: 3, knowledge_transfer: 3 }),

  features: z.record(z.string(), featureEntrySchema),

  self_score_after: z.number().min(1).max(10),
  utilization_after: z.number().min(0).max(100),
  potential_utilization: z.number().min(0).max(100),
  confidence_after: z.number().min(1).max(5),
  top_impact_categories: z.array(z.string()),
  free_text: z.string().optional().default(''),
  campaign_src: z.string().optional(),
  campaign_cid: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = surveySchema.parse(body);

    const scores = calculateFullScores(
      parsed.features as Record<string, FeatureEntry>,
      parsed.track,
      {
        self_score_before: parsed.self_score_before,
        self_score_after: parsed.self_score_after,
        utilization_after: parsed.utilization_after,
        potential_utilization: parsed.potential_utilization,
        knowledge_management: parsed.knowledge_management,
      },
    );

    const id = nanoid(12);
    const supabase = createServerClient();

    const { error } = await supabase.from('responses').insert({
      id,
      ...parsed,
      scores,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: 'Failed to save response' }, { status: 500 });
    }

    return NextResponse.json({ id, scores });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: err.issues }, { status: 400 });
    }
    console.error('POST /api/responses error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('responses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch responses' }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (err) {
    console.error('List responses error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
