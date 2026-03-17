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
  Tooltip,
} from 'recharts';
import type { ScoreResult } from '@/lib/scoring';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AdaptationProjectionProps {
  adaptation: ScoreResult['adaptation'];
  locale: string;
}

export function AdaptationProjection({ adaptation, locale: _locale }: AdaptationProjectionProps) {
  const t = useTranslations('results');

  const { currentPct, direction } = adaptation;

  // Exponential frontier: AI capabilities roughly double per year (index, today = 100)
  const frontier0 = 100;
  const frontier6 = Math.round(100 * Math.sqrt(2)); // ~141
  const frontier12 = 200;

  // "Bei aktuellem Tempo": stays at same % of frontier at each point
  const pace0 = Math.round((currentPct / 100) * frontier0); // = currentPct
  const pace6 = Math.round((currentPct / 100) * frontier6);
  const pace12 = Math.round((currentPct / 100) * frontier12);

  // "Mit gezielter Weiterbildung": starts at currentPct, catches up to frontier by +12 months
  const improved0 = pace0;
  const improved6 = Math.round(pace0 + (frontier12 - pace0) * 0.5);
  const improved12 = frontier12;

  const data = [
    { name: t('today'),        currentPace: pace0,   improved: improved0,   aiGrowth: frontier0  },
    { name: t('sixMonths'),    currentPace: pace6,   improved: improved6,   aiGrowth: frontier6  },
    { name: t('twelveMonths'), currentPace: pace12,  improved: improved12,  aiGrowth: frontier12 },
  ];

  // Text summary: user stays at currentPct% of frontier; with training they reach 100%
  const improvementDelta = 100 - currentPct;

  const directionLabel =
    direction === 'widening'
      ? t('gapWidening', { pct: currentPct })
      : direction === 'closing'
        ? t('gapClosing', { pct: currentPct })
        : t('gapStable', { pct: currentPct });

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
            <div className="mb-4 px-3 py-2 bg-muted/50 rounded-lg text-center">
              <p className="text-sm font-semibold text-green-700">
                {t('improvementPotential', { pct: improvementDelta })}
              </p>
            </div>
          )}

          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis
                domain={[0, 210]}
                tick={false}
                tickLine={false}
                label={{
                  value: t('capabilitiesAxis'),
                  angle: -90,
                  position: 'insideLeft',
                  style: { fontSize: 10, textAnchor: 'middle' },
                  dx: -8,
                }}
              />
              <Tooltip formatter={(value) => [`${value ?? ''}`, '']} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: '12px' }} />
              <Line
                type="monotone"
                dataKey="aiGrowth"
                name={t('aiGrowth')}
                stroke="#FFAB54"
                strokeWidth={2}
                dot={{ r: 4, fill: '#FFAB54' }}
                activeDot={{ r: 5 }}
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
