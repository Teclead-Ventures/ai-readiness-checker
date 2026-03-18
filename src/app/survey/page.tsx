'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { SurveyForm } from '@/components/survey/SurveyForm';
import { useCampaignTracking } from '@/hooks/useCampaignTracking';
import { hasConsent } from '@/hooks/useConsent';
import type { Track } from '@/types/survey';

function SurveyPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const trackParam = searchParams.get('track') as Track | null;
  const defaultTrack = trackParam === 'dev' || trackParam === 'business' ? trackParam : undefined;
  const consented = hasConsent();

  useCampaignTracking({ enabled: consented });

  useEffect(() => {
    if (!consented) {
      router.replace('/');
    }
  }, [consented, router]);

  if (!consented) return null;

  return <SurveyForm defaultTrack={defaultTrack} />;
}

export default function SurveyPage() {
  return (
    <Suspense>
      <SurveyPageContent />
    </Suspense>
  );
}
