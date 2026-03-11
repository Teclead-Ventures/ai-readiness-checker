'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { SurveyForm } from '@/components/survey/SurveyForm';
import { useCampaignTracking } from '@/hooks/useCampaignTracking';
import type { Track } from '@/types/survey';

function SurveyPageContent() {
  const searchParams = useSearchParams();
  const trackParam = searchParams.get('track') as Track | null;
  const defaultTrack = trackParam === 'dev' || trackParam === 'business' ? trackParam : undefined;

  useCampaignTracking();

  return <SurveyForm defaultTrack={defaultTrack} />;
}

export default function SurveyPage() {
  return (
    <Suspense>
      <SurveyPageContent />
    </Suspense>
  );
}
