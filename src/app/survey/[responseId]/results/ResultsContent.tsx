'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { SurveyResponse } from '@/types/survey';
import { useFunnelTracking } from '@/hooks/useFunnelTracking';
import { ReadinessGauge } from '@/components/results/ReadinessGauge';
import { AdaptationProjection } from '@/components/results/AdaptationProjection';
import { TierProgress } from '@/components/results/TierProgress';
import { SelfPerceptionComparison } from '@/components/results/SelfPerceptionComparison';
import { KMRadarChart } from '@/components/results/KMRadarChart';
import { RelevanceUsageMatrix } from '@/components/results/RelevanceUsageMatrix';
import { OpportunitiesList } from '@/components/results/OpportunitiesList';
import { TeamCTA } from '@/components/results/TeamCTA';
import { CalendlyEmbed } from '@/components/results/CalendlyEmbed';

interface ResultsContentProps {
  response: SurveyResponse;
  locale: string;
}

export function ResultsContent({ response, locale }: ResultsContentProps) {
  const t = useTranslations('results');
  const { trackStep } = useFunnelTracking(response.track);

  useEffect(() => {
    trackStep('results_view', 'enter');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>

      {/* Overall Score Gauge + Tier Progress side by side */}
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-10 items-start">
        <ReadinessGauge score={response.scores.overall} locale={locale} />
        <TierProgress
          tiers={response.scores.tiers}
          features={response.features}
          track={response.track}
          locale={locale}
        />
      </div>

      {/* 3. Adaptation Projection (urgency driver) */}
      <AdaptationProjection
        adaptation={response.scores.adaptation}
        locale={locale}
      />

      {/* 4. Relevance × Usage Matrix */}
      <RelevanceUsageMatrix
        features={response.features}
        track={response.track}
        locale={locale}
      />

      {/* 5. Knowledge Management Radar */}
      <KMRadarChart knowledgeManagement={response.knowledge_management} />

      {/* Self-Perception vs. Reality (combined) */}
      <SelfPerceptionComparison
        selfScoreBefore={response.self_score_before}
        selfScoreAfter={response.self_score_after}
        overallScore={response.scores.overall}
        confidenceBefore={response.confidence_before}
        confidenceAfter={response.confidence_after}
        knowledgeManagementScore={response.scores.knowledge_management}
        utilizationBefore={response.utilization_before}
        utilizationAfter={response.utilization_after}
        potentialUtilization={response.potential_utilization}
      />

      {/* 9. Top Opportunities */}
      <OpportunitiesList
        features={response.features}
        track={response.track}
        locale={locale}
      />

      {/* 10. Team CTA */}
      {!response.team_id && <TeamCTA />}

      {/* 11. Calendly Booking */}
      <CalendlyEmbed />
    </div>
  );
}
