'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { SurveyResponse } from '@/types/survey';
import { useFunnelTracking } from '@/hooks/useFunnelTracking';
import { ReadinessGauge } from '@/components/results/ReadinessGauge';
import { TimelinePosition } from '@/components/results/TimelinePosition';
import { AdaptationProjection } from '@/components/results/AdaptationProjection';
import { TierProgress } from '@/components/results/TierProgress';
import { GapComparison } from '@/components/results/GapComparison';
import { OpportunitiesList } from '@/components/results/OpportunitiesList';
import { TeamCTA } from '@/components/results/TeamCTA';
import { BookingCTA } from '@/components/results/BookingCTA';

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

      {/* 2. Timeline Position (hero) */}
      <TimelinePosition
        timeline={response.scores.timeline}
        adaptation={response.scores.adaptation}
        locale={locale}
      />

      {/* 3. Adaptation Projection (urgency driver) */}
      <AdaptationProjection
        adaptation={response.scores.adaptation}
        locale={locale}
      />


      {/* 6 & 7. Self-Awareness Gap + Utilization Gap */}
      <GapComparison
        selfScoreBefore={response.self_score_before}
        selfScoreAfter={response.self_score_after}
        utilizationAfter={response.utilization_after}
        potentialUtilization={response.potential_utilization}
        locale={locale}
      />

      {/* 9. Top Opportunities */}
      <OpportunitiesList
        features={response.features}
        track={response.track}
        locale={locale}
      />

      {/* 10. Team CTA */}
      {!response.team_id && <TeamCTA />}

      {/* 11. Booking CTA */}
      <BookingCTA />
    </div>
  );
}
