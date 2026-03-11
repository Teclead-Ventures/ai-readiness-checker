'use client';

import { useTranslations } from 'next-intl';
import { SurveyResponse } from '@/types/survey';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ReadinessGauge } from '@/components/results/ReadinessGauge';
import { RadarChart } from '@/components/results/RadarChart';
import { GapComparison } from '@/components/results/GapComparison';
import { FeatureBreakdown } from '@/components/results/FeatureBreakdown';
import { OpportunitiesList } from '@/components/results/OpportunitiesList';
import { TeamCTA } from '@/components/results/TeamCTA';

interface ResultsContentProps {
  response: SurveyResponse;
  locale: string;
}

export function ResultsContent({ response, locale }: ResultsContentProps) {
  const t = useTranslations('results');

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#121212]">{t('title')}</h1>
        <LanguageSwitcher variant="light" />
      </div>

      {/* Gauge - centered */}
      <div className="flex justify-center py-4">
        <ReadinessGauge score={response.scores.overall} locale={locale} />
      </div>

      {/* Charts grid - 2 columns on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RadarChart
          categories={response.scores.categories}
          track={response.track}
          locale={locale}
        />
        <FeatureBreakdown
          features={response.features}
          track={response.track}
          locale={locale}
        />
      </div>

      {/* Gap comparison - full width with internal 2-col */}
      <GapComparison
        selfScoreBefore={response.self_score_before}
        selfScoreAfter={response.self_score_after}
        utilizationAfter={response.utilization_after}
        potentialUtilization={response.potential_utilization}
        locale={locale}
      />

      {/* Opportunities */}
      <OpportunitiesList
        features={response.features}
        track={response.track}
        locale={locale}
      />

      {/* Team CTA */}
      {!response.team_id && <TeamCTA />}
    </div>
  );
}
