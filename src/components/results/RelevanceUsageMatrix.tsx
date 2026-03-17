'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { getCapabilitiesForTrack } from '@/lib/scoring';
import { TIER_CONFIG } from '@/lib/features/types';
import { FeatureEntry } from '@/types/survey';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RelevanceUsageMatrixProps {
  features: Record<string, FeatureEntry>;
  track: 'dev' | 'business';
  locale: string;
}

interface CapabilityItem {
  id: string;
  name: string;
  tier: number;
  tierLabel: string;
  score: number;
}

const TIER_COLORS: Record<number, string> = {
  1: '#3b82f6',
  2: '#8b5cf6',
  3: '#eab308',
  4: '#f97316',
  5: '#ef4444',
};

export function RelevanceUsageMatrix({ features, track, locale }: RelevanceUsageMatrixProps) {
  const t = useTranslations('results');
  const lang = locale as 'en' | 'de';
  const capabilities = getCapabilitiesForTrack(track);

  // Build quadrant arrays
  const priorityGaps: CapabilityItem[] = [];
  const strengths: CapabilityItem[] = [];
  const hiddenStrengths: CapabilityItem[] = [];
  const outOfScope: CapabilityItem[] = [];

  for (const cap of capabilities) {
    const entry = features[cap.id];
    if (!entry || typeof entry !== 'object') continue;

    const score = entry.score;
    const relevant = entry.relevant;

    // Skip unanswered capabilities
    if (score === undefined) continue;

    const item: CapabilityItem = {
      id: cap.id,
      name: cap[lang],
      tier: cap.tier,
      tierLabel: TIER_CONFIG[cap.tier][lang],
      score,
    };

    const isRelevant = relevant !== 'no'; // yes, unsure, or undefined → relevant
    const isHighUsage = score >= 2;       // Tried or Regularly used

    if (isRelevant && !isHighUsage) priorityGaps.push(item);
    else if (isRelevant && isHighUsage) strengths.push(item);
    else if (!isRelevant && isHighUsage) hiddenStrengths.push(item);
    else outOfScope.push(item);
  }

  // Sort: priority gaps by tier asc → score asc; strengths by score desc
  priorityGaps.sort((a, b) => a.tier - b.tier || a.score - b.score);
  strengths.sort((a, b) => a.tier - b.tier || b.score - a.score);
  hiddenStrengths.sort((a, b) => b.score - a.score);

  type QuadrantDef = {
    key: string;
    titleKey: string;
    descKey: string;
    items: CapabilityItem[];
    borderColor: string;
    countColor: string;
    showAll: boolean;
    countOnly?: boolean;
  };

  const quadrantDefs: QuadrantDef[] = [
    {
      key: 'priority_gaps',
      titleKey: 'matrixPriorityGaps',
      descKey: 'matrixPriorityGapsDesc',
      items: priorityGaps,
      borderColor: 'border-l-red-500',
      countColor: 'bg-red-500/10 text-red-600',
      showAll: true,
    },
    {
      key: 'strengths',
      titleKey: 'matrixStrengths',
      descKey: 'matrixStrengthsDesc',
      items: strengths,
      borderColor: 'border-l-green-500',
      countColor: 'bg-green-500/10 text-green-600',
      showAll: false,
    },
    {
      key: 'out_of_scope',
      titleKey: 'matrixOutOfScope',
      descKey: 'matrixOutOfScopeDesc',
      items: outOfScope,
      borderColor: 'border-l-border',
      countColor: 'bg-muted text-muted-foreground',
      showAll: false,
      countOnly: true,
    },
    {
      key: 'hidden_strengths',
      titleKey: 'matrixHiddenStrengths',
      descKey: 'matrixHiddenStrengthsDesc',
      items: hiddenStrengths,
      borderColor: 'border-l-blue-500',
      countColor: 'bg-blue-500/10 text-blue-600',
      showAll: false,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>{t('usageMatrix')}</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">{t('usageMatrixDesc')}</p>
        </CardHeader>
        <CardContent>
          {/* Axis labels */}
          <div className="mb-3 grid grid-cols-2 gap-4">
            <div className="text-center text-[10px] text-muted-foreground uppercase tracking-wider">
              ← {t('matrixAxisLowUsage')}
            </div>
            <div className="text-center text-[10px] text-muted-foreground uppercase tracking-wider">
              {t('matrixAxisHighUsage')} →
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quadrantDefs.map(({ key, titleKey, descKey, items, borderColor, countColor, showAll, countOnly }) => {
              const displayItems = showAll ? items : items.slice(0, 8);
              const overflow = items.length - displayItems.length;

              return (
                <div
                  key={key}
                  className={`rounded-lg border border-border border-l-4 ${borderColor} bg-muted/20 p-4`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">{t(titleKey)}</h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{t(descKey)}</p>
                    </div>
                    <span className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${countColor}`}>
                      {items.length}
                    </span>
                  </div>

                  {countOnly ? (
                    <p className="text-sm text-muted-foreground">
                      {t('matrixCapabilities', { n: items.length })}
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {displayItems.map((item) => (
                        <span
                          key={item.id}
                          className="inline-flex items-center gap-1 rounded-md border border-border bg-background/60 px-2 py-1 text-[11px]"
                          title={item.tierLabel}
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: TIER_COLORS[item.tier] }}
                          />
                          {item.name}
                        </span>
                      ))}
                      {overflow > 0 && (
                        <span className="inline-flex items-center rounded-md border border-border bg-muted/40 px-2 py-1 text-[11px] text-muted-foreground">
                          +{overflow} {t('matrixMore')}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
            {([1, 2, 3, 4, 5] as const).map((tier) => (
              <span key={tier} className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: TIER_COLORS[tier] }} />
                T{tier}: {TIER_CONFIG[tier][lang]}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
