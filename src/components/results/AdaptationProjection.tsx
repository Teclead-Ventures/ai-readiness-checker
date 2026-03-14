'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import type { ScoreResult } from '@/lib/scoring';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AdaptationProjectionProps {
  adaptation: ScoreResult['adaptation'];
  locale: string;
}

export function AdaptationProjection({ adaptation, locale: _locale }: AdaptationProjectionProps) {
  const t = useTranslations('results');

  const { currentPct, projectedPct12Months, improvedPct12Months, direction } = adaptation;

  // Midpoint interpolation (+6 months)
  const midCurrentPace = Math.round((currentPct + projectedPct12Months) / 2);
  const midImproved = Math.round((currentPct + improvedPct12Months) / 2);

  const data = [
    { name: t('today'), currentPace: currentPct, improved: currentPct, aiGrowth: 100 },
    { name: t('sixMonths'), currentPace: midCurrentPace, improved: midImproved, aiGrowth: 100 },
    { name: t('twelveMonths'), currentPace: projectedPct12Months, improved: improvedPct12Months, aiGrowth: 100 },
  ];

  const directionLabel =
    direction === 'widening'
      ? t('gapWidening', { pct: projectedPct12Months })
      : direction === 'closing'
        ? t('gapClosing', { pct: projectedPct12Months })
        : t('gapStable', { pct: projectedPct12Months });

  const improvementDelta = improvedPct12Months - projectedPct12Months;

  const directionColor =
    direction === 'widening'
      ? 'text-red-500'
      : direction === 'closing'
        ? 'text-green-500'
        : 'text-amber-500';

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
          {/* Key stat */}
          <div className="mb-2 p-3 bg-muted/50 rounded-lg text-center">
            <p className={`text-sm font-semibold ${directionColor}`}>
              {directionLabel}
            </p>
          </div>

          {improvementDelta > 0 && (
            <div className="mb-4 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-center">
              <p className="text-xs text-green-700">
                {t('improvementPotential', { pct: improvementDelta })}
              </p>
            </div>
          )}

          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
                tickFormatter={(v) => `${v}%`}
                label={{
                  value: t('capabilitiesAxis'),
                  angle: -90,
                  position: 'insideLeft',
                  style: { fontSize: 10, textAnchor: 'middle' },
                  dx: -8,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <ReferenceLine y={currentPct} stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={1} />
              <Line
                type="monotone"
                dataKey="aiGrowth"
                name={t('aiGrowth')}
                stroke="#94a3b8"
                strokeWidth={1.5}
                strokeDasharray="6 3"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="currentPace"
                name={t('currentPace')}
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ r: 4, fill: '#ef4444' }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="improved"
                name={t('improvedPace')}
                stroke="#22c55e"
                strokeWidth={2}
                strokeDasharray="6 3"
                dot={{ r: 4, fill: '#22c55e' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}
