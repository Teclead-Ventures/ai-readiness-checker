'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useFunnelTracking } from '@/hooks/useFunnelTracking';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { StepProgress } from './StepProgress';
import { TrackSelector } from './TrackSelector';
import { ProfileStep } from './ProfileStep';
import { SelfAssessmentStep } from './SelfAssessmentStep';
import { CurrentUsageStep } from './CurrentUsageStep';
import { MindsetStep } from './MindsetStep';
import { FeatureMatrixStep } from './FeatureMatrixStep';
import { FreeTextStep } from './FreeTextStep';
import { getCampaignFromSession } from '@/lib/campaign';
import type { Track, SurveyFormData } from '@/types/survey';

const TOTAL_STEPS = 8;

const STEP_IDS = ['track_select', 'profile', 'pre_assessment', 'current_usage', 'mindset', 'feature_matrix', 'post_assessment', 'free_text'] as const;

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 200 : -200,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 200 : -200,
    opacity: 0,
  }),
};

interface SurveyFormProps {
  defaultTrack?: Track;
  teamId?: string;
}

export function SurveyForm({ defaultTrack, teamId }: SurveyFormProps) {
  const t = useTranslations('survey');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialStep = Number(searchParams.get('step')) || 0;
  const [step, setStep] = useState(initialStep);
  const [direction, setDirection] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const methods = useForm<SurveyFormData>({
    defaultValues: {
      track: defaultTrack,
      language: 'en',
      team_id: teamId,
      respondent_name: '',
      profile: {
        role: '',
        experience_years: 0,
        languages: [],
        company_size: '',
      },
      self_score_before: 5,
      utilization_before: 0,
      confidence_before: 3,
      current_usage: {
        tools: [],
        modes: [],
        frequency: '',
        config_items: [],
      },
      openness: 3,
      barriers: [],
      priority_areas: [],
      features: {},
      self_score_after: 5,
      utilization_after: 0,
      potential_utilization: 50,
      confidence_after: 3,
      top_impact_categories: [],
      free_text: '',
    },
  });

  const track = methods.watch('track');
  const { trackStep } = useFunnelTracking(track);
  const prevStepRef = useRef(step);

  // Fire survey_start on mount
  useEffect(() => {
    trackStep('survey_start', 'enter');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Track step transitions
  useEffect(() => {
    const previousStep = prevStepRef.current;
    if (previousStep !== step) {
      trackStep(STEP_IDS[previousStep], 'complete');
      trackStep(STEP_IDS[step], 'enter');
      prevStepRef.current = step;
    }
  }, [step, trackStep]);

  const updateStepInUrl = useCallback(
    (newStep: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('step', String(newStep));
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const goNext = useCallback(() => {
    setDirection(1);
    setStep((s) => {
      const next = Math.min(s + 1, TOTAL_STEPS - 1);
      updateStepInUrl(next);
      return next;
    });
  }, [updateStepInUrl]);

  const goBack = useCallback(() => {
    setDirection(-1);
    setStep((s) => {
      const prev = Math.max(s - 1, 0);
      updateStepInUrl(prev);
      return prev;
    });
  }, [updateStepInUrl]);

  const handleTrackSelect = useCallback(
    (selected: Track) => {
      methods.setValue('track', selected);
      // Reset track-specific fields when switching
      if (selected === 'dev') {
        methods.setValue('profile', {
          role: '',
          experience_years: 0,
          languages: [],
          company_size: '',
        });
        methods.setValue('current_usage', {
          tools: [],
          modes: [],
          frequency: '',
          config_items: [],
        });
      } else {
        methods.setValue('profile', {
          role: '',
          experience_years: 0,
          industry: '',
          company_size: '',
        });
        methods.setValue('current_usage', {
          tools: [],
          usage_contexts: [],
          frequency: '',
        });
      }
      goNext();
    },
    [methods, goNext],
  );

  const onSubmit = useCallback(
    async (data: SurveyFormData) => {
      setSubmitting(true);
      try {
        const campaign = getCampaignFromSession();
        const res = await fetch('/api/responses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...data,
            campaign_src: campaign.src || undefined,
            campaign_cid: campaign.cid || undefined,
          }),
        });
        if (!res.ok) throw new Error('Submit failed');
        const { id } = await res.json();
        trackStep('submit', 'complete');
        router.push(`/survey/${id}/results`);
      } catch {
        setSubmitting(false);
        alert(tCommon('error'));
      }
    },
    [router, tCommon, trackStep],
  );

  const isLastStep = step === TOTAL_STEPS - 1;
  const isFirstStep = step === 0;

  const renderStep = () => {
    if (!track && step > 0) {
      setStep(0);
      return null;
    }

    switch (step) {
      case 0:
        return <TrackSelector onSelect={handleTrackSelect} selected={track} />;
      case 1:
        return <ProfileStep track={track!} />;
      case 2:
        return <SelfAssessmentStep variant="before" />;
      case 3:
        return <CurrentUsageStep track={track!} />;
      case 4:
        return <MindsetStep track={track!} />;
      case 5:
        return <FeatureMatrixStep track={track!} />;
      case 6:
        return (
          <div className="space-y-10">
            <SelfAssessmentStep variant="after" />
          </div>
        );
      case 7:
        return <FreeTextStep track={track!} />;
      default:
        return null;
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="mx-auto w-full max-w-2xl px-4 py-8 space-y-6"
      >
        {/* Progress */}
        {step > 0 && (
          <StepProgress currentStep={step} totalSteps={TOTAL_STEPS - 1} />
        )}

        {/* Step Content */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        {step > 0 && (
          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={goBack}
              disabled={isFirstStep}
              className="min-w-[100px] h-11 bg-white text-[#121212] border border-gray-300 hover:bg-gray-50 rounded-lg px-8 py-3"
            >
              {tCommon('back')}
            </Button>

            {isLastStep ? (
              <Button
                type="submit"
                size="lg"
                disabled={submitting}
                className="min-w-[100px] h-11 bg-[#FFAB54] text-[#121212] font-bold hover:bg-[#FFAB54]/90 rounded-lg px-8 py-3"
              >
                {submitting ? t('submitting') : tCommon('submit')}
              </Button>
            ) : (
              <Button
                type="button"
                size="lg"
                onClick={goNext}
                className="min-w-[100px] h-11 bg-[#FFAB54] text-[#121212] font-bold hover:bg-[#FFAB54]/90 rounded-lg px-8 py-3"
              >
                {tCommon('next')}
              </Button>
            )}
          </div>
        )}
      </form>
    </FormProvider>
  );
}
