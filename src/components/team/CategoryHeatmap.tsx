'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SurveyResponse, Track } from '@/types/survey';
import { getFeaturesForTrack } from '@/lib/scoring';

interface CategoryHeatmapProps {
  responses: SurveyResponse[];
  track: Track | 'both';
  anonymous: boolean;
  locale: string;
}

function getCellColor(score: number): string {
  if (score <= 30) return '#ef4444';
  if (score <= 55) return '#f59e0b';
  if (score <= 75) return '#eab308';
  if (score <= 90) return '#22c55e';
  return '#3b82f6';
}

function getTextColor(score: number): string {
  if (score <= 30) return '#fff';
  if (score <= 55) return '#fff';
  if (score <= 75) return '#000';
  if (score <= 90) return '#fff';
  return '#fff';
}

export function CategoryHeatmap({
  responses,
  track,
  anonymous,
  locale,
}: CategoryHeatmapProps) {
  const t = useTranslations('team.dashboard');

  if (responses.length === 0) return null;

  // Group responses by track
  const devResponses = responses.filter((r) => r.track === 'dev');
  const businessResponses = responses.filter((r) => r.track === 'business');

  const renderHeatmap = (
    trackResponses: SurveyResponse[],
    trackType: Track,
    showTrackLabel: boolean
  ) => {
    if (trackResponses.length === 0) return null;

    const features = getFeaturesForTrack(trackType);
    const categoryKeys = Object.keys(features).sort();
    const lang = (locale === 'de' ? 'de' : 'en') as 'en' | 'de';

    // Sort by date DESC
    const sorted = [...trackResponses].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return (
      <div className="space-y-2">
        {showTrackLabel && (
          <h4 className="text-sm font-medium capitalize">{trackType}</h4>
        )}
        <div className="overflow-x-auto">
          <table className="text-xs w-full">
            <thead>
              <tr>
                <th className="text-left p-1.5 min-w-[120px] font-medium text-muted-foreground">
                  {t('member')}
                </th>
                {categoryKeys.map((key) => (
                  <th
                    key={key}
                    className="p-1.5 text-center font-medium text-muted-foreground min-w-[40px]"
                    title={features[key].name[lang]}
                  >
                    {key}
                  </th>
                ))}
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
                    {categoryKeys.map((key) => {
                      const score = response.scores.categories[key] ?? 0;
                      return (
                        <td
                          key={key}
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
        {/* Legend */}
        <div className="flex gap-3 text-xs text-muted-foreground flex-wrap mt-2">
          {categoryKeys.map((key) => (
            <span key={key}>
              <strong>{key}</strong> = {features[key].name[lang]}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const showTrackLabels = track === 'both' && devResponses.length > 0 && businessResponses.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('heatmap')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {(track === 'both' || track === 'dev') &&
          renderHeatmap(devResponses.length > 0 ? devResponses : responses.filter(r => r.track === 'dev'), 'dev', showTrackLabels)}
        {(track === 'both' || track === 'business') &&
          renderHeatmap(businessResponses.length > 0 ? businessResponses : responses.filter(r => r.track === 'business'), 'business', showTrackLabels)}
        {/* Color legend */}
        <div className="flex gap-2 items-center text-xs flex-wrap">
          <span className="text-muted-foreground">Score:</span>
          {[
            { range: '0-30', color: '#ef4444', textColor: '#fff' },
            { range: '31-55', color: '#f59e0b', textColor: '#fff' },
            { range: '56-75', color: '#eab308', textColor: '#000' },
            { range: '76-90', color: '#22c55e', textColor: '#fff' },
            { range: '91-100', color: '#3b82f6', textColor: '#fff' },
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
