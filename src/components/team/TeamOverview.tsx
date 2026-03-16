'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TeamWithResponses, getScoreLabel } from '@/types/survey';
import { TIER_CONFIG } from '@/lib/features/types';

interface TeamOverviewProps {
  team: TeamWithResponses;
  locale: string;
}

function scoreToColor(score: number): string {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#84cc16';
  if (score >= 40) return '#eab308';
  if (score >= 20) return '#f97316';
  return '#ef4444';
}

export function TeamOverview({ team, locale }: TeamOverviewProps) {
  const t = useTranslations('team.dashboard');
  const responses = team.responses;

  if (responses.length === 0) return null;

  const avgScore = Math.round(
    responses.reduce((sum, r) => sum + r.scores.overall, 0) / responses.length
  );
  const scoreLabel = getScoreLabel(avgScore);
  const lang = (locale === 'de' ? 'de' : 'en') as 'en' | 'de';

  const tierAverages = ([1, 2, 3, 4, 5] as const).map((tier) => {
    const values = responses
      .filter((r) => r.scores.tiers[tier] !== undefined)
      .map((r) => r.scores.tiers[tier]);
    const avg = values.length
      ? Math.round(values.reduce((s, v) => s + v, 0) / values.length)
      : 0;
    const config = TIER_CONFIG[tier];
    return {
      tier,
      name: config[lang],
      era: config.era,
      score: avg,
    };
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Score Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {t('avgScore')}
            <Badge variant="secondary">{t('responses')}: {responses.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-4">
          <div
            className="text-6xl font-bold"
            style={{ color: scoreLabel.color }}
          >
            {avgScore}
          </div>
          <div className="text-lg font-medium mt-2" style={{ color: scoreLabel.color }}>
            {scoreLabel.label[lang]}
          </div>
        </CardContent>
      </Card>

      {/* Category Overview */}
      <Card>
        <CardHeader>
          <CardTitle>{t('heatmap')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {tierAverages.map(({ tier, name, era, score }) => (
              <div key={tier} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{name}</span>
                  <span className="shrink-0 text-xs text-muted-foreground tabular-nums ml-2">
                    {score}%
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${score}%`,
                      backgroundColor: scoreToColor(score),
                    }}
                  />
                </div>
                {era && <p className="text-xs text-muted-foreground">{era}</p>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
