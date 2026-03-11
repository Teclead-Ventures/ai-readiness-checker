'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SurveyResponse } from '@/types/survey';

interface AdaptationSummaryProps {
  responses: SurveyResponse[];
}

export function AdaptationSummary({ responses }: AdaptationSummaryProps) {
  const t = useTranslations('team.dashboard');

  if (responses.length === 0) return null;

  const directions = { widening: 0, stable: 0, closing: 0 };
  responses.forEach((r) => {
    const dir = r.scores.adaptation?.direction;
    if (dir && dir in directions) {
      directions[dir]++;
    }
  });

  const total = responses.length;

  const items = [
    {
      key: 'closing' as const,
      label: t('directionClosing'),
      count: directions.closing,
      color: '#22c55e',
      bgColor: '#f0fdf4',
    },
    {
      key: 'stable' as const,
      label: t('directionStable'),
      count: directions.stable,
      color: '#eab308',
      bgColor: '#fefce8',
    },
    {
      key: 'widening' as const,
      label: t('directionWidening'),
      count: directions.widening,
      color: '#ef4444',
      bgColor: '#fef2f2',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('adaptationSummary')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {items.map((item) => (
            <div
              key={item.key}
              className="rounded-lg p-4 text-center"
              style={{ backgroundColor: item.bgColor }}
            >
              <div className="text-3xl font-bold" style={{ color: item.color }}>
                {item.count}
              </div>
              <div className="text-sm font-medium mt-1" style={{ color: item.color }}>
                {item.label}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {total > 0 ? Math.round((item.count / total) * 100) : 0}%
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
