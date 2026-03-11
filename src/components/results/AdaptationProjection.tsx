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
  timeline: ScoreResult['timeline'];
  locale: string;
}

export function AdaptationProjection({ adaptation, timeline, locale }: AdaptationProjectionProps) {
  const t = useTranslations('results');

  const currentGap = timeline.frontierAheadMonths;
  const projectedGap = adaptation.projectedGap12Months;

  // "At current pace" line: linear interpolation from current gap to projected gap
  // "If you improve" line: assume adopting 2 more capabilities/quarter closes ~2 months/quarter
  const improvedGap6 = Math.max(0, currentGap - 4);
  const improvedGap12 = Math.max(0, currentGap - 8);

  const midpointGap = Math.round(currentGap + (projectedGap - currentGap) / 2);

  const data = [
    {
      name: t('today'),
      currentPace: currentGap,
      improved: currentGap,
    },
    {
      name: t('sixMonths'),
      currentPace: midpointGap,
      improved: improvedGap6,
    },
    {
      name: t('twelveMonths'),
      currentPace: projectedGap,
      improved: improvedGap12,
    },
  ];

  const directionLabel =
    adaptation.direction === 'widening'
      ? t('gapWidening', { months: projectedGap })
      : adaptation.direction === 'closing'
        ? t('gapClosing', { months: projectedGap })
        : t('gapStable', { months: currentGap });

  const directionColor =
    adaptation.direction === 'widening'
      ? 'text-red-500'
      : adaptation.direction === 'closing'
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
          <div className="mb-4 p-3 bg-muted/50 rounded-lg text-center">
            <p className={`text-sm font-semibold ${directionColor}`}>
              {directionLabel}
            </p>
          </div>

          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis
                tick={{ fontSize: 12 }}
                label={{
                  value: t('monthsBehindAxis'),
                  angle: -90,
                  position: 'insideLeft',
                  style: { fontSize: 11, textAnchor: 'middle' },
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line
                type="monotone"
                dataKey="currentPace"
                name={t('currentPace')}
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="8 4"
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="improved"
                name={t('improvedPace')}
                stroke="#22c55e"
                strokeWidth={2}
                strokeDasharray="6 3"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}
