import { Capability, TIER_CONFIG } from './features/types';
import { DEV_CAPABILITIES } from './features/dev-features';
import { BUSINESS_CAPABILITIES } from './features/business-features';
import type { FeatureEntry, FeatureRelevance } from '@/types/survey';

export interface ScoreResult {
  // Core readiness score (0-100)
  overall: number;
  // Score per tier (0-100)
  tiers: Record<number, number>;
  // Whether a tier was entirely marked irrelevant (shown as N/A)
  tiersNA: Record<number, boolean>;
  // Timeline analysis
  timeline: {
    // "You're operating at a [Month Year] level"
    timelinePosition: string;       // e.g. "2024-07"
    timelinePositionLabel: string;  // e.g. "mid-2024"
    // Months between your latest adoption and now
    gapMonths: number;
    // The most recent capability you've integrated
    latestAdoption: string | null;  // e.g. "2024-07"
    // The most recent capability in the dataset (frontier)
    frontier: string;               // e.g. "2026-02"
    // How many months the frontier is ahead of your latest adoption
    frontierAheadMonths: number;
  };
  // Adaptation analysis
  adaptation: {
    // % of available capabilities currently used
    currentPct: number;
    // Projected % at current pace after 12 months
    projectedPct12Months: number;
    // Projected % with targeted upskilling after 12 months
    improvedPct12Months: number;
    // Direction: "widening" | "stable" | "closing"
    direction: "widening" | "stable" | "closing";
  };
  // Knowledge management score (0-100), separate dimension
  knowledge_management: number;
  // Self-awareness gaps
  awareness_gap: number;
  utilization_gap: number;
}

export function getCapabilitiesForTrack(track: 'dev' | 'business'): Capability[] {
  return track === 'dev' ? DEV_CAPABILITIES : BUSINESS_CAPABILITIES;
}

// Extract numeric score from a FeatureEntry (or plain number for backwards compat)
function getScore(entry: FeatureEntry | number | undefined): number | undefined {
  if (entry === undefined || entry === null) return undefined;
  if (typeof entry === 'number') return entry;
  return entry.score;
}

// Extract relevance from a FeatureEntry
function getRelevance(entry: FeatureEntry | number | undefined): FeatureRelevance | undefined {
  if (typeof entry === 'object' && entry !== null) return entry.relevant;
  return undefined;
}

export function calculateScores(
  features: Record<string, FeatureEntry | number>,
  capabilities: Capability[],
): Omit<ScoreResult, 'awareness_gap' | 'utilization_gap' | 'knowledge_management'> {
  const now = new Date();
  const nowMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // ── Tier-weighted readiness score ──────────────────────────────
  const tierScores: Record<number, number> = {};
  const tiersNA: Record<number, boolean> = {};
  let weightedSum = 0;
  let weightedMax = 0;

  for (const tier of [1, 2, 3, 4, 5] as const) {
    const tierCaps = capabilities.filter(c => c.tier === tier);

    // Exclude capabilities explicitly marked as not relevant
    const relevantCaps = tierCaps.filter(c => getRelevance(features[c.id]) !== 'no');

    if (relevantCaps.length === 0) {
      // Entire tier marked irrelevant or has no caps — skip
      tierScores[tier] = 0;
      tiersNA[tier] = true;
      continue;
    }

    tiersNA[tier] = false;
    const answered = relevantCaps.filter(c => getScore(features[c.id]) !== undefined);
    if (answered.length === 0) { tierScores[tier] = 0; continue; }

    const tierSum = answered.reduce((sum, c) => sum + (getScore(features[c.id]) ?? 0), 0);
    const tierMax = answered.length * 3;
    tierScores[tier] = Math.round((tierSum / tierMax) * 100);

    const weight = TIER_CONFIG[tier].weight;
    weightedSum += tierSum * weight;
    weightedMax += tierMax * weight;
  }

  const overall = weightedMax > 0 ? Math.round((weightedSum / weightedMax) * 100) : 0;

  // ── Timeline position ─────────────────────────────────────────
  const integratedCaps = capabilities
    .filter(c => getScore(features[c.id]) === 3)
    .sort((a, b) => b.firstAvailable.localeCompare(a.firstAvailable));

  const latestAdoption = integratedCaps.length > 0 ? integratedCaps[0].firstAvailable : null;
  const frontier = [...capabilities]
    .sort((a, b) => b.firstAvailable.localeCompare(a.firstAvailable))[0].firstAvailable;

  const gapMonths = latestAdoption
    ? monthsBetween(latestAdoption, nowMonth)
    : monthsBetween("2022-01", nowMonth);

  const frontierAheadMonths = latestAdoption
    ? monthsBetween(latestAdoption, frontier)
    : monthsBetween("2022-01", frontier);

  // ── Percentage-based adaptation ───────────────────────────────
  // How many total capabilities are there, and how many does the user have as "regularly used"?
  const totalCaps = capabilities.length;
  const usedCaps = capabilities.filter(c => getScore(features[c.id]) === 3).length;
  const currentPct = totalCaps > 0 ? Math.round((usedCaps / totalCaps) * 100) : 0;

  // Innovation rate: new capabilities per year over the dataset span
  const uniqueDates = [...new Set(capabilities.map(c => c.firstAvailable))].sort();
  const timeSpanYears = monthsBetween(uniqueDates[0], uniqueDates[uniqueDates.length - 1]) / 12;
  const innovationRate = capabilities.length / Math.max(timeSpanYears, 1); // caps/year

  // Adoption rate: how many caps has the user integrated per year
  const adoptionRate = usedCaps / Math.max(timeSpanYears, 1);

  // At current pace: project 12 months forward
  const yearlyGapChange = innovationRate - adoptionRate;
  const projectedUsed12 = Math.max(0, Math.min(totalCaps, usedCaps + adoptionRate));
  const projectedPct12Months = Math.round((projectedUsed12 / totalCaps) * 100);

  // With upskilling: assume user adopts 2 extra capabilities per quarter = 8/year
  const upskilledUsed12 = Math.max(0, Math.min(totalCaps, usedCaps + adoptionRate + 8));
  const improvedPct12Months = Math.round((upskilledUsed12 / totalCaps) * 100);

  const direction: "widening" | "stable" | "closing" =
    yearlyGapChange > 1 ? "widening" :
    yearlyGapChange < -1 ? "closing" : "stable";

  return {
    overall,
    tiers: tierScores,
    tiersNA,
    timeline: {
      timelinePosition: latestAdoption ?? "2022-01",
      timelinePositionLabel: formatMonthLabel(latestAdoption ?? "2022-01"),
      gapMonths,
      latestAdoption,
      frontier,
      frontierAheadMonths,
    },
    adaptation: {
      currentPct,
      projectedPct12Months,
      improvedPct12Months,
      direction,
    },
  };
}

export function calculateKnowledgeManagementScore(km: {
  awareness: number;
  filtering: number;
  contextualization: number;
  overload: number;
  knowledge_transfer: number;
}): number {
  // Overload is inverted (5 = very overwhelmed = bad)
  const invertedOverload = 6 - km.overload;
  const avg = (km.awareness + km.filtering + km.contextualization + invertedOverload + km.knowledge_transfer) / 5;
  // Normalize from 1-5 scale to 0-100
  return Math.round(((avg - 1) / 4) * 100);
}

export function calculateFullScores(
  features: Record<string, FeatureEntry | number>,
  track: 'dev' | 'business',
  response: {
    self_score_before: number;
    self_score_after: number;
    utilization_after: number;
    potential_utilization: number;
    knowledge_management?: {
      awareness: number;
      filtering: number;
      contextualization: number;
      overload: number;
      knowledge_transfer: number;
    };
  }
): ScoreResult {
  const capabilities = getCapabilitiesForTrack(track);
  const scores = calculateScores(features, capabilities);

  const km = response.knowledge_management ?? {
    awareness: 3, filtering: 3, contextualization: 3, overload: 3, knowledge_transfer: 3,
  };

  return {
    ...scores,
    knowledge_management: calculateKnowledgeManagementScore(km),
    awareness_gap: response.self_score_before - response.self_score_after,
    utilization_gap: response.potential_utilization - response.utilization_after,
  };
}

function monthsBetween(a: string, b: string): number {
  const [ay, am] = a.split('-').map(Number);
  const [by, bm] = b.split('-').map(Number);
  return (by - ay) * 12 + (bm - am);
}

function formatMonthLabel(date: string): string {
  const [year, month] = date.split('-').map(Number);
  const quarter = month <= 3 ? 'early' : month <= 6 ? 'mid' : 'late';
  return `${quarter} ${year}`;
}
