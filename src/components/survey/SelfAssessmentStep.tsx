'use client';

import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import type { SurveyFormData } from '@/types/survey';

interface SelfAssessmentStepProps {
  variant: 'before' | 'after';
}

function extractValue(val: number | readonly number[]): number {
  return Array.isArray(val) ? val[0] : (val as number);
}

export function SelfAssessmentStep({ variant }: SelfAssessmentStepProps) {
  const t = useTranslations('survey.selfAssessment');
  const { setValue, watch } = useFormContext<SurveyFormData>();

  const suffix = variant === 'before' ? '_before' : '_after';
  const isBefore = variant === 'before';

  const selfScore = (watch(`self_score${suffix}` as keyof SurveyFormData) as number) ?? 5;
  const utilization = (watch(`utilization${suffix}` as keyof SurveyFormData) as number) ?? 0;
  const confidence = (watch(`confidence${suffix}` as keyof SurveyFormData) as number) ?? 3;
  const potentialUtilization = variant === 'after'
    ? ((watch('potential_utilization') as number) ?? 50)
    : 0;

  return (
    <div className="space-y-8">
      <h2 className="text-xl sm:text-[1.875rem] font-bold font-display hyphens-auto">
        {isBefore ? t('titleBefore') : t('titleAfter')}
      </h2>

      {/* Self Score (1–10) */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-4">
        <Label className="text-base font-medium">{t('scoreLabel')}</Label>
        <div className="flex items-center gap-4">
          <Slider
            value={[selfScore]}
            onValueChange={(val) =>
              setValue(`self_score${suffix}` as keyof SurveyFormData, extractValue(val) as never)
            }
            min={1}
            max={10}
            step={1}
            className="flex-1"
          />
          <span className="text-2xl font-bold tabular-nums w-10 text-center">
            {selfScore}
          </span>
        </div>
        <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
          <span>{t('scoreMin')}</span>
          <span>{t('scoreMax')}</span>
        </div>
      </div>

      {/* Utilization (0–100%) */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-4">
        <Label className="text-base font-medium">
          {isBefore ? t('utilizationLabel') : t('utilizationAfterLabel')}
        </Label>
        <div className="flex items-center gap-4">
          <Slider
            value={[utilization]}
            onValueChange={(val) =>
              setValue(`utilization${suffix}` as keyof SurveyFormData, extractValue(val) as never)
            }
            min={0}
            max={100}
            step={5}
            className="flex-1"
          />
          <span className="text-2xl font-bold tabular-nums w-14 text-center">
            {utilization}%
          </span>
        </div>
      </div>

      {/* Potential Utilization (only for 'after') */}
      {variant === 'after' && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-4">
          <Label className="text-base font-medium">{t('potentialLabel')}</Label>
          <div className="flex items-center gap-4">
            <Slider
              value={[potentialUtilization]}
              onValueChange={(val) =>
                setValue('potential_utilization', extractValue(val) as never)
              }
              min={0}
              max={100}
              step={5}
              className="flex-1"
            />
            <span className="text-2xl font-bold tabular-nums w-14 text-center">
              {potentialUtilization}%
            </span>
          </div>
        </div>
      )}

      {/* Confidence (1–5) */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-4">
        <Label className="text-base font-medium">{t('confidenceLabel')}</Label>
        <div className="flex items-center gap-4">
          <Slider
            value={[confidence]}
            onValueChange={(val) =>
              setValue(`confidence${suffix}` as keyof SurveyFormData, extractValue(val) as never)
            }
            min={1}
            max={5}
            step={1}
            className="flex-1"
          />
          <span className="text-2xl font-bold tabular-nums w-10 text-center">
            {confidence}
          </span>
        </div>
        <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
          <span>{t('confidenceMin')}</span>
          <span>{t('confidenceMax')}</span>
        </div>
      </div>
    </div>
  );
}
