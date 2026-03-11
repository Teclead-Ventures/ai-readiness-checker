import { FeatureValue, FeatureData, Scores } from '@/types/survey';
import { DEV_FEATURES } from '@/lib/features/dev-features';
import { BUSINESS_FEATURES } from '@/lib/features/business-features';

export function getFeaturesForTrack(track: 'dev' | 'business'): FeatureData {
  return track === 'dev' ? DEV_FEATURES : BUSINESS_FEATURES;
}

export function calculateScores(
  features: Record<string, FeatureValue>,
  track: 'dev' | 'business'
): { overall: number; categories: Record<string, number> } {
  const featureData = getFeaturesForTrack(track);
  const categoryScores: Record<string, number> = {};
  let totalScore = 0;
  let totalItems = 0;

  for (const [catKey, category] of Object.entries(featureData)) {
    const items = category.items;
    let catSum = 0;
    for (const item of items) {
      catSum += features[item.id] ?? 0;
    }
    categoryScores[catKey] = Math.round((catSum / (items.length * 2)) * 100);
    totalScore += catSum;
    totalItems += items.length;
  }

  const overall = Math.round((totalScore / (totalItems * 2)) * 100);
  return { overall, categories: categoryScores };
}

export function calculateGaps(response: {
  self_score_before: number;
  self_score_after: number;
  utilization_after: number;
  potential_utilization: number;
}): { awareness_gap: number; utilization_gap: number } {
  return {
    awareness_gap: response.self_score_before - response.self_score_after,
    utilization_gap: response.potential_utilization - response.utilization_after,
  };
}

export function calculateFullScores(
  features: Record<string, FeatureValue>,
  track: 'dev' | 'business',
  response: {
    self_score_before: number;
    self_score_after: number;
    utilization_after: number;
    potential_utilization: number;
  }
): Scores {
  const { overall, categories } = calculateScores(features, track);
  const gaps = calculateGaps(response);
  return {
    overall,
    categories,
    ...gaps,
  };
}
