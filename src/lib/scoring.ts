import { Capability, TIER_CONFIG } from './features/types';
import { DEV_CAPABILITIES } from './features/dev-features';
import { BUSINESS_CAPABILITIES } from './features/business-features';

export interface ScoreResult {
  // Core readiness score (0-100)
  overall: number;
  // Score per tier (0-100)
  tiers: Record<number, number>;
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
    // Capabilities integrated per year (estimated from pattern)
    adoptionRate: number;
    // New capabilities released per year (from our data)
    innovationRate: number;
    // Projected gap in 12 months (months behind)
    projectedGap12Months: number;
    // Direction: "widening" | "stable" | "closing"
    direction: "widening" | "stable" | "closing";
  };
  // Self-awareness gaps
  awareness_gap: number;
  utilization_gap: number;
}

export function getCapabilitiesForTrack(track: 'dev' | 'business'): Capability[] {
  return track === 'dev' ? DEV_CAPABILITIES : BUSINESS_CAPABILITIES;
}

export function calculateScores(
  features: Record<string, number>,
  capabilities: Capability[],
): Omit<ScoreResult, 'awareness_gap' | 'utilization_gap'> {
  const now = new Date();
  const nowMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // ── Tier-weighted readiness score ──────────────────────────────
  const tierScores: Record<number, number> = {};
  let weightedSum = 0;
  let weightedMax = 0;

  for (const tier of [1, 2, 3, 4, 5] as const) {
    const tierCaps = capabilities.filter(c => c.tier === tier);
    const answered = tierCaps.filter(c => features[c.id] !== undefined);
    if (answered.length === 0) { tierScores[tier] = 0; continue; }

    const tierSum = answered.reduce((sum, c) => sum + (features[c.id] ?? 0), 0);
    const tierMax = answered.length * 3; // max is 3 (Integrated)
    tierScores[tier] = Math.round((tierSum / tierMax) * 100);

    const weight = TIER_CONFIG[tier].weight;
    weightedSum += tierSum * weight;
    weightedMax += tierMax * weight;
  }

  const overall = weightedMax > 0 ? Math.round((weightedSum / weightedMax) * 100) : 0;

  // ── Timeline position ─────────────────────────────────────────
  // Find the most recent capability the user has "Integrated" (value 3)
  const integratedCaps = capabilities
    .filter(c => features[c.id] === 3)
    .sort((a, b) => b.firstAvailable.localeCompare(a.firstAvailable));

  const latestAdoption = integratedCaps.length > 0 ? integratedCaps[0].firstAvailable : null;
  const frontier = [...capabilities]
    .sort((a, b) => b.firstAvailable.localeCompare(a.firstAvailable))[0].firstAvailable;

  const gapMonths = latestAdoption
    ? monthsBetween(latestAdoption, nowMonth)
    : monthsBetween("2022-01", nowMonth); // no adoptions = fully behind

  const frontierAheadMonths = latestAdoption
    ? monthsBetween(latestAdoption, frontier)
    : monthsBetween("2022-01", frontier);

  // ── Adaptation rate ───────────────────────────────────────────
  const uniqueDates = [...new Set(capabilities.map(c => c.firstAvailable))].sort();
  const timeSpanYears = monthsBetween(uniqueDates[0], uniqueDates[uniqueDates.length - 1]) / 12;
  const innovationRate = capabilities.length / Math.max(timeSpanYears, 1);

  const adoptionRate = integratedCaps.length / Math.max(timeSpanYears, 1);

  const currentGapCaps = capabilities.length - integratedCaps.length;
  const yearlyGapChange = innovationRate - adoptionRate;
  const projectedGapCaps12 = currentGapCaps + yearlyGapChange;

  const avgMonthsPerCap = (monthsBetween(uniqueDates[0], frontier)) / capabilities.length;
  const projectedGap12Months = Math.round(projectedGapCaps12 * avgMonthsPerCap);

  const direction: "widening" | "stable" | "closing" =
    yearlyGapChange > 1 ? "widening" :
    yearlyGapChange < -1 ? "closing" : "stable";

  return {
    overall,
    tiers: tierScores,
    timeline: {
      timelinePosition: latestAdoption ?? "2022-01",
      timelinePositionLabel: formatMonthLabel(latestAdoption ?? "2022-01"),
      gapMonths,
      latestAdoption,
      frontier,
      frontierAheadMonths,
    },
    adaptation: {
      adoptionRate: Math.round(adoptionRate * 10) / 10,
      innovationRate: Math.round(innovationRate * 10) / 10,
      projectedGap12Months,
      direction,
    },
  };
}

export function calculateFullScores(
  features: Record<string, number>,
  track: 'dev' | 'business',
  response: {
    self_score_before: number;
    self_score_after: number;
    utilization_after: number;
    potential_utilization: number;
  }
): ScoreResult {
  const capabilities = getCapabilitiesForTrack(track);
  const scores = calculateScores(features, capabilities);
  return {
    ...scores,
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
