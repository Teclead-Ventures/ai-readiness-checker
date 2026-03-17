'use client';

import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import type { ScoreResult } from '@/lib/scoring';
import { TIER_CONFIG } from '@/lib/features/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type TierKey = 1 | 2 | 3 | 4 | 5;

interface TierData {
  tier: TierKey;
  score: number;
  gap: number;
  weight: number;
  weightedGap: number;
}

// Month 0 = today (no focus label), months 1-5 = tier focus, month 6 = synthesis
type MonthFocus =
  | { kind: 'today' }
  | { kind: 'tier'; tier: TierKey; score: number; gap: number }
  | { kind: 'synthesis' };

interface DataPoint {
  name: string;
  withTraining: number;
  withoutChange: number;
  focus: MonthFocus;
}

interface AdaptationProjectionProps {
  adaptation: ScoreResult['adaptation'];
  tiers: ScoreResult['tiers'];
  tiersNA: ScoreResult['tiersNA'];
  locale: string;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function RoadmapTooltip({ active, payload, label, locale }: any) {
  if (!active || !payload?.length) return null;

  const dataPoint = payload[0]?.payload as DataPoint | undefined;
  const focus = dataPoint?.focus;

  return (
    <div className="bg-popover border border-border rounded-lg p-3 shadow-lg text-sm min-w-[190px]">
      <p className="font-semibold text-foreground mb-1.5">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color }} className="text-xs leading-relaxed">
          {entry.name}: <span className="font-medium">{entry.value}%</span>
        </p>
      ))}
      {focus?.kind === 'tier' && (
        <div className="text-xs text-muted-foreground mt-1.5 pt-1.5 border-t border-border">
          <p>
            {locale === 'de' ? 'Fokus' : 'Focus'}:{' '}
            <span className="font-medium text-foreground">
              {locale === 'de' ? TIER_CONFIG[focus.tier].de : TIER_CONFIG[focus.tier].en}
            </span>
          </p>
          <p className="text-muted-foreground/70">
            {locale === 'de' ? 'Dein Score' : 'Your score'}: {focus.score}%
          </p>
        </div>
      )}
      {focus?.kind === 'synthesis' && (
        <div className="text-xs text-muted-foreground mt-1.5 pt-1.5 border-t border-border">
          <p className="font-medium text-foreground">
            {locale === 'de' ? 'Synthese & Anwendung' : 'Synthesis & Application'}
          </p>
          <p className="text-muted-foreground/70">
            {locale === 'de'
              ? 'Alle Fähigkeiten verknüpfen und im Alltag verankern'
              : 'Connecting all skills and embedding them in daily work'}
          </p>
        </div>
      )}
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export function AdaptationProjection({
  adaptation,
  tiers,
  tiersNA,
  locale,
}: AdaptationProjectionProps) {
  const t = useTranslations('results');

  const { currentPct, direction } = adaptation;

  // ── Active tiers: non-NA and not already maxed out ──────────────
  const activeTiers: TierData[] = ([1, 2, 3, 4, 5] as TierKey[])
    .filter((tier) => !tiersNA[tier] && (tiers[tier] ?? 0) < 100)
    .map((tier) => {
      const score = tiers[tier] ?? 0;
      const gap = Math.max(0, 100 - score);
      const weight = TIER_CONFIG[tier].weight;
      return { tier, score, gap, weight, weightedGap: gap * weight };
    });

  // ── Sort by learning priority ───────────────────────────────────
  // Group: T1/T2 (foundations) → T3 (productive) → T4/T5 (advanced)
  // Within each group: highest weighted gap first (biggest return on effort)
  const tiersByPriority = [...activeTiers].sort((a, b) => {
    const groupA = a.tier <= 2 ? 0 : a.tier <= 3 ? 1 : 2;
    const groupB = b.tier <= 2 ? 0 : b.tier <= 3 ? 1 : 2;
    if (groupA !== groupB) return groupA - groupB;
    return b.weightedGap - a.weightedGap;
  });

  // ── Personalized 6-month target ─────────────────────────────────
  const advancedCeiling = 78;
  const gapToCeiling = Math.max(0, advancedCeiling - currentPct);
  const closingFactor =
    currentPct < 20 ? 0.55 : currentPct < 40 ? 0.65 : currentPct < 60 ? 0.75 : 0.85;
  const targetPct = Math.round(currentPct + gapToCeiling * closingFactor);
  const delta = targetPct - currentPct;

  // ── Data-driven monthly growth distribution ─────────────────────
  // Each month's increment is proportional to its tier's weighted gap:
  //   weightedGap = gap × tierWeight  (T5 gap contributes 2.5× more than T1 gap)
  // → months focused on high-value, high-gap tiers produce steeper rises
  // Distribution: months 1-5 receive 90% of delta, month 6 (synthesis) gets 10%
  const totalWeightedGap = activeTiers.reduce((sum, t) => sum + t.weightedGap, 0);

  // Raw share per month — tiers that appear multiple times get diminishing returns (0.5×)
  const rawShares = Array.from({ length: 5 }, (_, m): number => {
    if (!tiersByPriority.length || totalWeightedGap === 0) return 1;
    const tier = tiersByPriority[m % tiersByPriority.length];
    const isRepeat = m >= tiersByPriority.length;
    return (tier.weightedGap / totalWeightedGap) * (isRepeat ? 0.5 : 1.0);
  });

  const rawShareSum = rawShares.reduce((a, b) => a + b, 0);
  // Normalize so tier months always contribute exactly 90% of delta
  const tierIncrements = rawShares.map((s) =>
    rawShareSum > 0 ? (s / rawShareSum) * delta * 0.9 : delta * 0.18,
  );

  // ── Monthly focus for tooltip (months 1-5 = tiers, month 6 = synthesis) ──
  const monthlyFocus: MonthFocus[] = [
    // Months 1-5: one unique tier per month (5 tiers = perfectly one each)
    ...Array.from({ length: 5 }, (_, m): MonthFocus => {
      const tier = tiersByPriority[m % tiersByPriority.length];
      if (!tier) return { kind: 'synthesis' };
      return { kind: 'tier', tier: tier.tier, score: tier.score, gap: tier.gap };
    }),
    // Month 6: always synthesis — combining and applying all learned skills
    { kind: 'synthesis' },
  ];

  // ── "Without change" subtle decline ────────────────────────────
  const declineRate =
    direction === 'widening' ? 1.0 : direction === 'stable' ? 0.5 : 0.3;

  // ── Build chart data (today + 6 months) ────────────────────────
  const data: DataPoint[] = [];
  let cumTraining = currentPct;

  data.push({
    name: t('today'),
    withTraining: currentPct,
    withoutChange: currentPct,
    focus: { kind: 'today' },
  });

  for (let m = 0; m < 6; m++) {
    const inc = m < 5 ? tierIncrements[m] : delta * 0.1;
    cumTraining = Math.min(100, Math.round(cumTraining + inc));
    data.push({
      name: t('monthN', { n: m + 1 }),
      withTraining: cumTraining,
      withoutChange: Math.round(Math.max(0, currentPct - declineRate * (m + 1))),
      focus: monthlyFocus[m],
    });
  }

  const growthAmount = targetPct - currentPct;

  const tooltipContent = useCallback(
    (props: any) => <RoadmapTooltip {...props} locale={locale} />,
    [locale],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>{t('adaptationTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          {growthAmount > 0 && (
            <div className="mb-4 p-3 bg-muted/50 rounded-lg text-center">
              <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                {t('growthPotential', { from: currentPct, to: targetPct })}
              </p>
            </div>
          )}

          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="trainingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `${v}%`}
                width={45}
              />
              <Tooltip content={tooltipContent} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: '12px' }} />

              {/* Advanced practitioner reference line */}
              <ReferenceLine
                y={advancedCeiling}
                stroke="#94a3b8"
                strokeDasharray="6 4"
                label={{
                  value: t('advancedPractitioner'),
                  position: 'insideTopRight',
                  fontSize: 10,
                  fill: '#94a3b8',
                }}
              />

              {/* With guided training — hero area (green, filled) */}
              <Area
                type="monotone"
                dataKey="withTraining"
                name={t('withTraining')}
                stroke="#22c55e"
                fill="url(#trainingGradient)"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#22c55e', strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />

              {/* Without change — subtle gray, dashed */}
              <Area
                type="monotone"
                dataKey="withoutChange"
                name={t('withoutChange')}
                stroke="#94a3b8"
                fill="rgba(148,163,184,0.05)"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                dot={{ r: 3, fill: '#94a3b8', strokeWidth: 0 }}
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}
