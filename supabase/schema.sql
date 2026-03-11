-- Enable pgcrypto for gen_random_uuid if needed
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Function to generate nanoid-like IDs
CREATE OR REPLACE FUNCTION nanoid(size int DEFAULT 10)
RETURNS text AS $$
DECLARE
  id text := '';
  i int := 0;
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  char_length int := length(chars);
BEGIN
  WHILE i < size LOOP
    id := id || substr(chars, 1 + floor(random() * char_length)::int, 1);
    i := i + 1;
  END LOOP;
  RETURN id;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Teams created by managers
CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY DEFAULT nanoid(),
  name TEXT NOT NULL,
  created_by_name TEXT,
  created_by_email TEXT,
  track_preset TEXT CHECK (track_preset IN ('dev', 'business', 'both')) DEFAULT 'both',
  anonymous BOOLEAN DEFAULT false,
  language TEXT CHECK (language IN ('en', 'de')) DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Individual survey responses (both individual and team-linked)
CREATE TABLE IF NOT EXISTS responses (
  id TEXT PRIMARY KEY DEFAULT nanoid(),
  team_id TEXT REFERENCES teams(id) ON DELETE SET NULL,
  track TEXT NOT NULL CHECK (track IN ('dev', 'business')),
  respondent_name TEXT,
  language TEXT CHECK (language IN ('en', 'de')) DEFAULT 'en',

  -- Section 1: Profile (JSONB)
  profile JSONB NOT NULL DEFAULT '{}',

  -- Section 2: Pre-exposure self-assessment
  self_score_before INTEGER CHECK (self_score_before BETWEEN 1 AND 10),
  utilization_before INTEGER CHECK (utilization_before BETWEEN 0 AND 100),
  confidence_before INTEGER CHECK (confidence_before BETWEEN 1 AND 5),

  -- Section 3: Current usage (JSONB)
  current_usage JSONB NOT NULL DEFAULT '{}',

  -- Section 4: Mindset
  openness INTEGER CHECK (openness BETWEEN 1 AND 5),
  barriers TEXT[] DEFAULT '{}',
  priority_areas TEXT[] DEFAULT '{}',

  -- Section 5: Feature awareness matrix (JSONB)
  features JSONB NOT NULL DEFAULT '{}',

  -- Section 6: Post-exposure re-assessment
  self_score_after INTEGER CHECK (self_score_after BETWEEN 1 AND 10),
  utilization_after INTEGER CHECK (utilization_after BETWEEN 0 AND 100),
  potential_utilization INTEGER CHECK (potential_utilization BETWEEN 0 AND 100),
  confidence_after INTEGER CHECK (confidence_after BETWEEN 1 AND 5),
  top_impact_categories TEXT[] DEFAULT '{}',
  free_text TEXT,

  -- Computed scores
  scores JSONB NOT NULL DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_responses_team ON responses(team_id);
CREATE INDEX IF NOT EXISTS idx_responses_track ON responses(track);
CREATE INDEX IF NOT EXISTS idx_responses_created ON responses(created_at DESC);
