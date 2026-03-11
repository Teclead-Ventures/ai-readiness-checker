'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SurveyResponse } from '@/types/survey';
import { TIER_CONFIG } from '@/lib/features/types';

interface CategoryHeatmapProps {
  responses: SurveyResponse[];
  track: 'dev' | 'business' | 'both';
  anonymous: boolean;
  locale: string;
}

function getCellColor(score: number): string {
  if (score <= 30) return '#E5E7EB';
  if (score <= 55) return '#FDD9AA';
  if (score <= 75) return '#FCC47A';
  if (score <= 90) return '#FFAB54';
  return '#F59520';
}

function getTextColor(score: number): string {
  if (score <= 30) return '#444D69';
  return '#121212';
}

const TIERS = [1, 2, 3, 4, 5] as const;

export function CategoryHeatmap({
  responses,
  anonymous,
  locale,
}: CategoryHeatmapProps) {
  const t = useTranslations('team.dashboard');

  if (responses.length === 0) return null;

  const lang = (locale === 'de' ? 'de' : 'en') as 'en' | 'de';

  // Sort by date DESC
  const sorted = [...responses].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('heatmap')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="overflow-x-auto">
          <table className="text-xs w-full">
            <thead>
              <tr>
                <th className="text-left p-1.5 min-w-[120px] font-medium text-muted-foreground">
                  {t('member')}
                </th>
                {TIERS.map((tier) => {
                  const config = TIER_CONFIG[tier];
                  return (
                    <th
                      key={tier}
                      className="p-1.5 text-center font-medium text-muted-foreground min-w-[60px]"
                      title={`${config[lang]} (${config.era})`}
                    >
                      T{tier}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {sorted.map((response, index) => {
                const displayName = anonymous
                  ? `${t('anonymous')} #${sorted.length - index}`
                  : response.respondent_name || `${t('anonymous')} #${sorted.length - index}`;

                return (
                  <tr key={response.id}>
                    <td className="p-1.5 font-medium truncate max-w-[150px]">
                      {displayName}
                    </td>
                    {TIERS.map((tier) => {
                      const score = response.scores.tiers[tier] ?? 0;
                      return (
                        <td
                          key={tier}
                          className="p-1 text-center"
                        >
                          <div
                            className="rounded px-1 py-0.5 text-xs font-medium mx-auto w-10"
                            style={{
                              backgroundColor: getCellColor(score),
                              color: getTextColor(score),
                            }}
                          >
                            {score}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* Tier legend */}
        <div className="flex gap-3 text-xs text-muted-foreground flex-wrap">
          {TIERS.map((tier) => {
            const config = TIER_CONFIG[tier];
            return (
              <span key={tier}>
                <strong>T{tier}</strong> = {config[lang]} ({config.era})
              </span>
            );
          })}
        </div>
        {/* Color legend */}
        <div className="flex gap-2 items-center text-xs flex-wrap">
          <span className="text-muted-foreground">Score:</span>
          {[
            { range: '0-30', color: '#E5E7EB', textColor: '#444D69' },
            { range: '31-55', color: '#FDD9AA', textColor: '#121212' },
            { range: '56-75', color: '#FCC47A', textColor: '#121212' },
            { range: '76-90', color: '#FFAB54', textColor: '#121212' },
            { range: '91-100', color: '#F59520', textColor: '#121212' },
          ].map((l) => (
            <span
              key={l.range}
              className="rounded px-1.5 py-0.5 font-medium"
              style={{ backgroundColor: l.color, color: l.textColor }}
            >
              {l.range}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
