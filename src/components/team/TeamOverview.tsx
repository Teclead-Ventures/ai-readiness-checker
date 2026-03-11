'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TeamWithResponses, getScoreLabel } from '@/types/survey';
import { getFeaturesForTrack } from '@/lib/scoring';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';

interface TeamOverviewProps {
  team: TeamWithResponses;
  locale: string;
}

export function TeamOverview({ team, locale }: TeamOverviewProps) {
  const t = useTranslations('team.dashboard');
  const responses = team.responses;

  if (responses.length === 0) return null;

  // Calculate team average overall score
  const avgScore = Math.round(
    responses.reduce((sum, r) => sum + r.scores.overall, 0) / responses.length
  );
  const scoreLabel = getScoreLabel(avgScore);
  const lang = (locale === 'de' ? 'de' : 'en') as 'en' | 'de';

  // Calculate average category scores
  const allCategoryKeys = new Set<string>();
  responses.forEach((r) => {
    Object.keys(r.scores.categories).forEach((k) => allCategoryKeys.add(k));
  });

  // Determine which tracks are present
  const tracks = new Set(responses.map((r) => r.track));
  const primaryTrack = tracks.size === 1 ? responses[0].track : 'dev';
  const features = getFeaturesForTrack(primaryTrack);

  const categoryAverages = Array.from(allCategoryKeys)
    .sort()
    .map((key) => {
      const values = responses
        .filter((r) => r.scores.categories[key] !== undefined)
        .map((r) => r.scores.categories[key]);
      const avg = values.length
        ? Math.round(values.reduce((s, v) => s + v, 0) / values.length)
        : 0;
      const catName = features[key]?.name?.[lang] || key;
      return { category: catName, shortKey: key, score: avg };
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

      {/* Radar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Readiness Radar</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={categoryAverages} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid />
              <PolarAngleAxis dataKey="shortKey" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Radar
                dataKey="score"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.3}
              />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
