-- Add missing columns to responses table
ALTER TABLE responses
  ADD COLUMN IF NOT EXISTS barriers_other TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS knowledge_management JSONB NOT NULL DEFAULT '{}';

-- Fix missing comma that prevented campaign columns from being created
ALTER TABLE responses
  ADD COLUMN IF NOT EXISTS campaign_src TEXT,
  ADD COLUMN IF NOT EXISTS campaign_cid TEXT;
