'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { useTranslations, useLocale } from 'next-intl';
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
import { KnowledgeManagementStep } from './KnowledgeManagementStep';
import { getCampaignFromSession } from '@/lib/campaign';
import type { Track, SurveyFormData } from '@/types/survey';

const STEP_IDS = ['track_select', 'profile', 'pre_assessment', 'current_usage', 'mindset', 'knowledge_management', 'feature_matrix', 'post_assessment', 'free_text'] as const;

const TOTAL_STEPS = STEP_IDS.length;

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
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [step, setStep] = useState(() => Number(searchParams.get('step')) || 0);
  const [direction, setDirection] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const methods = useForm<SurveyFormData>({
    defaultValues: {
      track: defaultTrack,
      language: locale,
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
      barriers_other: '',
      priority_areas: [],
      knowledge_management: {
        awareness: 3,
        filtering: 3,
        contextualization: 3,
        overload: 3,
        knowledge_transfer: 3,
      },
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
  const trackStepRef = useRef(trackStep);
  useEffect(() => {
    trackStepRef.current = trackStep;
  }, [trackStep]);

  // Fire survey_start on mount
  useEffect(() => {
    trackStepRef.current('survey_start', 'enter');
  }, []);

  // Track step transitions
  useEffect(() => {
    const previousStep = prevStepRef.current;
    if (previousStep !== step) {
      trackStep(STEP_IDS[previousStep], 'complete');
      trackStep(STEP_IDS[step], 'enter');
      prevStepRef.current = step;
    }
  }, [step, trackStep]);

  const searchParamsRef = useRef(searchParams);
  useEffect(() => {
    searchParamsRef.current = searchParams;
  }, [searchParams]);

  // Sync step to URL after state update (avoids setState-during-render)
  useEffect(() => {
    const params = new URLSearchParams(searchParamsRef.current.toString());
    params.set('step', String(step));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [step, router, pathname]);

  // Guard: if track is lost (e.g. on direct URL access), reset to step 0
  useEffect(() => {
    if (!track && step > 0) {
      setStep(0);
    }
  }, [track, step]);

  const goNext = useCallback(() => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  }, []);

  const goBack = useCallback(() => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  }, []);

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
    async (_data: SurveyFormData) => {
      setSubmitting(true);
      setSubmitError(null);
      try {
        const campaign = getCampaignFromSession();
        // Use getValues() to capture all form values, including fields that are only
        // tracked via watch/setValue and never registered via Controller/register.
        const values = methods.getValues();
        const res = await fetch('/api/responses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...values,
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
        setSubmitError(tCommon('error'));
      }
    },
    [methods, router, tCommon, trackStep],
  );

  const isLastStep = step === TOTAL_STEPS - 1;

  const renderStep = () => {
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
        return <KnowledgeManagementStep />;
      case 6:
        return <FeatureMatrixStep track={track!} />;
      case 7:
        return <SelfAssessmentStep variant="after" />;
      case 8:
        return <FreeTextStep track={track!} />;
      default:
        return null;
    }
  };

  return (
    <Form {...methods}>
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

        {/* Submit error */}
        {submitError && (
          <p className="text-sm text-red-600 text-center">{submitError}</p>
        )}

        {/* Navigation */}
        {step > 0 && (
          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={goBack}
              className="min-w-[100px] h-11 bg-white text-[#121212] border border-gray-300 hover:bg-gray-50 rounded-lg px-8 py-3"
            >
              {tCommon('back')}
            </Button>

            {isLastStep ? (
              <Button
                key="submit-btn"
                type="submit"
                size="lg"
                disabled={submitting}
                className="min-w-[100px] h-11 bg-[#FFAB54] text-[#121212] font-bold hover:bg-[#FFAB54]/90 rounded-lg px-8 py-3"
              >
                {submitting ? t('submitting') : tCommon('submit')}
              </Button>
            ) : (
              <Button
                key="next-btn"
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
    </Form>
  );
}
