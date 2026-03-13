'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { TIER_CONFIG } from '@/lib/features/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RadarChartProps {
  tiers: Record<number, number>;
  tiersNA?: Record<number, boolean>;
  locale: string;
}

function scoreToColor(score: number): string {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#84cc16';
  if (score >= 40) return '#eab308';
  if (score >= 20) return '#f97316';
  return '#ef4444';
}

export function RadarChart({ tiers, tiersNA, locale }: RadarChartProps) {
  const t = useTranslations('results');
  const lang = (locale === 'de' ? 'de' : 'en') as 'en' | 'de';

  const data = ([1, 2, 3, 4, 5] as const).map((tier) => ({
    tier,
    name: TIER_CONFIG[tier][lang],
    era: TIER_CONFIG[tier].era,
    score: tiers[tier] ?? 0,
    isNA: tiersNA?.[tier] ?? false,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>{t('radar')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {data.map(({ tier, name, era, score, isNA }) => (
              <div key={tier} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{name}</span>
                  <span className="shrink-0 text-xs text-muted-foreground tabular-nums ml-2">
                    {isNA ? 'N/A' : `${score}%`}
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                  {isNA ? (
                    <div className="h-full w-full bg-muted-foreground/20 rounded-full" />
                  ) : (
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${score}%`,
                        backgroundColor: scoreToColor(score),
                      }}
                    />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{era}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
