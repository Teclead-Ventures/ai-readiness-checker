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
  Tooltip,
  LabelList,
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
    <div className="bg-popover border border-border rounded-lg p-3 shadow-lg text-sm min-w-[200px]">
      <p className="font-semibold text-foreground mb-1.5">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color }} className="text-xs leading-relaxed">
          {entry.name}: <span className="font-medium">{entry.value}%</span>
          {entry.dataKey === 'withoutChange' && focus?.kind !== 'today' && (
            <span className="text-muted-foreground/60 ml-1">
              {locale === 'de' ? '(neue KI-Tools nicht übernommen)' : '(new AI tools not adopted)'}
            </span>
          )}
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

// End-point label rendered only at the last data point
function EndLabel({ x, y, value, color, index, total }: any) {
  if (index !== total - 1 || value === null || value === undefined) return null;
  return (
    <text
      x={(x ?? 0) + 8}
      y={(y ?? 0) + 4}
      fill={color}
      fontSize={12}
      fontWeight="700"
      style={{ userSelect: 'none' }}
    >
      {value}%
    </text>
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
  const tiersByPriority = [...activeTiers].sort((a, b) => {
    const groupA = a.tier <= 2 ? 0 : a.tier <= 3 ? 1 : 2;
    const groupB = b.tier <= 2 ? 0 : b.tier <= 3 ? 1 : 2;
    if (groupA !== groupB) return groupA - groupB;
    return b.weightedGap - a.weightedGap;
  });

  // ── Personalized 6-month target ─────────────────────────────────
  const advancedCeiling = 78;
  let targetPct: number;
  if (currentPct >= advancedCeiling) {
    // Already advanced: training gives a small consolidation benefit
    // (15% of remaining gap to 100) — keeps the line slightly above flat
    targetPct = Math.min(100, currentPct + Math.round((100 - currentPct) * 0.15));
  } else {
    const gapToCeiling = advancedCeiling - currentPct;
    const closingFactor =
      currentPct < 20 ? 0.55 : currentPct < 40 ? 0.65 : currentPct < 60 ? 0.75 : 0.85;
    targetPct = Math.round(currentPct + gapToCeiling * closingFactor);
  }
  const delta = targetPct - currentPct;

  // ── Data-driven monthly growth (proportional to tier opportunity) ─
  const totalWeightedGap = activeTiers.reduce((sum, t) => sum + t.weightedGap, 0);
  const rawShares = Array.from({ length: 5 }, (_, m): number => {
    if (!tiersByPriority.length || totalWeightedGap === 0) return 1;
    const tier = tiersByPriority[m % tiersByPriority.length];
    return (tier.weightedGap / totalWeightedGap) * (m >= tiersByPriority.length ? 0.5 : 1.0);
  });
  const rawShareSum = rawShares.reduce((a, b) => a + b, 0);
  const tierIncrements = rawShares.map((s) =>
    rawShareSum > 0 ? (s / rawShareSum) * delta * 0.9 : delta * 0.18,
  );

  // ── Monthly focus for tooltip ───────────────────────────────────
  const monthlyFocus: MonthFocus[] = [
    ...Array.from({ length: 5 }, (_, m): MonthFocus => {
      const tier = tiersByPriority[m % tiersByPriority.length];
      if (!tier) return { kind: 'synthesis' };
      return { kind: 'tier', tier: tier.tier, score: tier.score, gap: tier.gap };
    }),
    { kind: 'synthesis' },
  ];

  // ── "Without training" decline ─────────────────────────────────
  // New AI tools keep appearing — relative standing slips even if you don't forget anything.
  // High scorers already follow AI developments naturally and self-adopt, so their
  // effective decline is much smaller. Scale from full decline at 0% → ~10% at 100%.
  const baseDeclineRate =
    direction === 'widening' ? 1.0 : direction === 'stable' ? 0.5 : 0.3;
  const scoreDeclineFactor = Math.max(0.08, 1 - (currentPct / 100) * 0.9);
  const declineRate = baseDeclineRate * scoreDeclineFactor;

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
  const endWithTraining = data[data.length - 1].withTraining;
  const endWithoutChange = data[data.length - 1].withoutChange;
  const silentFall = currentPct - endWithoutChange; // how many pts you lose vs today

  // ── Smart Y-axis domain: focus on the relevant range ───────────
  const allValues = data.flatMap((d) => [d.withTraining, d.withoutChange]);
  const rawMin = Math.min(...allValues);
  const rawMax = Math.max(...allValues);
  const yMin = Math.max(0, Math.floor((rawMin - 8) / 10) * 10);
  const yMax = Math.min(100, Math.ceil((rawMax + 12) / 10) * 10);

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
          {/* Two-scenario summary — scannable at a glance */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="p-3 rounded-lg border border-green-500/30 bg-green-500/5 text-center">
              <p className="text-xs text-muted-foreground mb-1">{t('withTraining')}</p>
              <p className="text-2xl font-bold text-green-500">{endWithTraining}%</p>
              {currentPct >= 99 ? (
                <p className="text-xs text-green-600/80 mt-0.5 leading-tight">
                  {t('frontierNote')}
                </p>
              ) : growthAmount > 0 ? (
                <p className="text-xs text-green-600/80 mt-0.5">
                  +{growthAmount} {locale === 'de' ? 'Punkte' : 'points'}
                </p>
              ) : null}
            </div>
            <div className="p-3 rounded-lg border border-slate-500/20 bg-slate-500/5 text-center">
              <p className="text-xs text-muted-foreground mb-1">{t('withoutTraining')}</p>
              <p className="text-2xl font-bold text-slate-400">{endWithoutChange}%</p>
              {currentPct >= 99 ? (
                <p className="text-xs text-slate-500/80 mt-0.5 leading-tight">
                  {t('maintainEdgeNote')}
                </p>
              ) : endWithoutChange === 0 ? (
                <p className="text-xs text-amber-500/80 mt-0.5 leading-tight">
                  {t('zeroDeclineNote')}
                </p>
              ) : silentFall > 0 ? (
                <p className="text-xs text-slate-500/80 mt-0.5">
                  −{silentFall} {locale === 'de' ? 'Punkte' : 'points'}
                </p>
              ) : null}
            </div>
          </div>

          {/* Chart: the journey between now and those two outcomes */}
          {/* Subtle warm background = landscape is active and moving */}
          <div
            className="rounded-md overflow-hidden"
            style={{
              background:
                'linear-gradient(to right, transparent 0%, rgba(245,158,11,0.04) 60%, rgba(245,158,11,0.09) 100%)',
            }}
          >
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={data} margin={{ top: 10, right: 55, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="trainingGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis
                  domain={[yMin, yMax]}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => `${v}%`}
                  width={42}
                />
                <Tooltip content={tooltipContent} />

                {/* Without training — gray dashed, with end label */}
                <Area
                  type="monotone"
                  dataKey="withoutChange"
                  name={t('withoutTraining')}
                  stroke="#94a3b8"
                  fill="rgba(148,163,184,0.06)"
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                  dot={false}
                  activeDot={{ r: 4, fill: '#94a3b8' }}
                >
                  <LabelList
                    dataKey="withoutChange"
                    content={(props: any) => (
                      <EndLabel
                        {...props}
                        color="#94a3b8"
                        total={data.length}
                      />
                    )}
                  />
                </Area>

                {/* With training — green hero area, with end label */}
                <Area
                  type="monotone"
                  dataKey="withTraining"
                  name={t('withTraining')}
                  stroke="#22c55e"
                  fill="url(#trainingGradient)"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 6, fill: '#22c55e' }}
                >
                  <LabelList
                    dataKey="withTraining"
                    content={(props: any) => (
                      <EndLabel
                        {...props}
                        color="#22c55e"
                        total={data.length}
                      />
                    )}
                  />
                </Area>
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Plain-language explanation of the decline — single sentence */}
          {silentFall > 0 && (
            <p className="mt-3 text-xs text-muted-foreground text-center leading-relaxed px-2">
              {t('landscapeNote', { gap: silentFall })}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
