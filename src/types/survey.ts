export type Track = 'dev' | 'business';
export type FeatureValue = 0 | 1 | 2; // 0=don't know, 1=know, 2=use

export interface FeatureItem {
  id: string;
  en: string;
  de: string;
}

export interface FeatureCategory {
  name: { en: string; de: string };
  items: FeatureItem[];
}

export type FeatureData = Record<string, FeatureCategory>;

export interface DevProfile {
  role: string;
  experience_years: number;
  languages: string[];
  company_size: string;
}

export interface BusinessProfile {
  role: string;
  experience_years: number;
  industry: string;
  company_size: string;
}

export interface DevCurrentUsage {
  tools: string[];
  modes: string[];
  frequency: string;
  config_items: string[];
}

export interface BusinessCurrentUsage {
  tools: string[];
  usage_contexts: string[];
  frequency: string;
}

export interface SurveyFormData {
  track: Track;
  respondent_name?: string;
  language: string;
  team_id?: string;

  // Profile
  profile: DevProfile | BusinessProfile;

  // Pre-assessment
  self_score_before: number;
  utilization_before: number;
  confidence_before: number;

  // Current usage
  current_usage: DevCurrentUsage | BusinessCurrentUsage;

  // Mindset
  openness: number;
  barriers: string[];
  priority_areas: string[];

  // Feature matrix
  features: Record<string, FeatureValue>;

  // Post-assessment
  self_score_after: number;
  utilization_after: number;
  potential_utilization: number;
  confidence_after: number;
  top_impact_categories: string[];
  free_text?: string;
}

export interface Scores {
  overall: number;
  categories: Record<string, number>;
  awareness_gap?: number;
  utilization_gap?: number;
}

export interface SurveyResponse extends SurveyFormData {
  id: string;
  scores: Scores;
  created_at: string;
}

export interface Team {
  id: string;
  name: string;
  created_by_name: string;
  created_by_email?: string;
  track_preset: 'dev' | 'business' | 'both';
  anonymous: boolean;
  language: string;
  created_at: string;
}

export interface TeamWithResponses extends Team {
  responses: SurveyResponse[];
}

export const SCORE_LABELS = [
  { min: 0, max: 30, label: { en: 'Getting Started', de: 'Erste Schritte' }, color: '#ef4444' },
  { min: 31, max: 55, label: { en: 'Building Foundations', de: 'Grundlagen aufbauen' }, color: '#f59e0b' },
  { min: 56, max: 75, label: { en: 'Proficient', de: 'Kompetent' }, color: '#eab308' },
  { min: 76, max: 90, label: { en: 'Advanced', de: 'Fortgeschritten' }, color: '#22c55e' },
  { min: 91, max: 100, label: { en: 'Pioneer', de: 'Pionier' }, color: '#3b82f6' },
] as const;

export function getScoreLabel(score: number) {
  return SCORE_LABELS.find(l => score >= l.min && score <= l.max) ?? SCORE_LABELS[0];
}

export const DEV_ROLES = [
  'Frontend', 'Backend', 'Fullstack', 'DevOps', 'Data', 'Mobile', 'Embedded', 'Other'
] as const;

export const BUSINESS_ROLES = [
  'C-Level', 'VP', 'Director', 'Product Manager', 'Project Manager',
  'Designer', 'Marketing', 'HR', 'Operations', 'Other'
] as const;

export const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-1000', '1000+'] as const;

export const INDUSTRIES = [
  'Tech', 'Finance', 'Healthcare', 'Manufacturing', 'Retail',
  'Education', 'Government', 'Other'
] as const;

export const DEV_LANGUAGES = [
  'JS/TS', 'Python', 'Java', 'C#', 'Go', 'Rust', 'Dart',
  'C/C++', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Other'
] as const;

export const DEV_TOOLS = [
  'Copilot', 'Claude Code', 'Cursor', 'Windsurf', 'ChatGPT', 'Claude.ai',
  'Gemini', 'Amazon Q', 'Tabnine', 'Cody', 'Aider', 'JetBrains AI', 'None', 'Other'
] as const;

export const DEV_MODES = [
  'Autocomplete', 'IDE Chat', 'Browser Chat', 'Agent Mode', 'CLI', 'Voice', 'None'
] as const;

export const DEV_CONFIG = [
  'CLAUDE.md/.cursorrules', 'Custom skills', 'MCP servers', 'Hooks',
  'Git worktrees', 'Memory management', 'None', 'Not sure'
] as const;

export const BUSINESS_TOOLS = [
  'ChatGPT', 'Claude.ai', 'Gemini', 'Perplexity', 'Microsoft Copilot',
  'Notion AI', 'Slack AI', 'Other'
] as const;

export const BUSINESS_CONTEXTS = [
  'Writing', 'Research', 'Data Analysis', 'Presentations',
  'Email', 'Meetings', 'Project Management', 'None'
] as const;

export const FREQUENCIES = [
  'Never', 'Monthly', 'Weekly', 'Daily', 'Multiple times daily'
] as const;

export const BARRIERS = [
  'Client restrictions', 'Security concerns', 'Quality concerns',
  'No time', 'Tools sufficient', 'Slow hardware', 'Cost',
  'Philosophical concerns', 'Nothing blocks me', 'Other'
] as const;
