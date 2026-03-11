'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { Track, SurveyFormData } from '@/types/survey';
import { getFeaturesForTrack } from '@/lib/scoring';

interface FreeTextStepProps {
  track: Track;
}

export function FreeTextStep({ track }: FreeTextStepProps) {
  const t = useTranslations('survey.postAssessment');
  const locale = useLocale();
  const { register, setValue, watch } = useFormContext<SurveyFormData>();

  const topCategories = watch('top_impact_categories') || [];
  const featureData = getFeaturesForTrack(track);
  const categoryNames = Object.entries(featureData).map(([key, cat]) => ({
    key,
    name: locale === 'de' ? cat.name.de : cat.name.en,
  }));

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">{t('title')}</h2>

      {/* Top Impact Categories (select 3) */}
      <div className="space-y-3">
        <Label className="text-base font-medium">{t('topCategories')}</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {categoryNames.map(({ key, name }) => {
            const checked = topCategories.includes(key);
            const atLimit = topCategories.length >= 3 && !checked;
            return (
              <label
                key={key}
                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors min-h-[44px] ${
                  atLimit
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-muted/50'
                } ${checked ? 'border-primary bg-primary/5' : ''}`}
              >
                <Checkbox
                  checked={checked}
                  disabled={atLimit}
                  onCheckedChange={(isChecked) => {
                    if (isChecked && topCategories.length < 3) {
                      setValue('top_impact_categories', [...topCategories, key]);
                    } else if (!isChecked) {
                      setValue(
                        'top_impact_categories',
                        topCategories.filter((c) => c !== key)
                      );
                    }
                  }}
                />
                <span className="text-sm">{name}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Free text */}
      <div className="space-y-2">
        <Label className="text-base font-medium">{t('freeText')}</Label>
        <Textarea
          placeholder={t('freeTextPlaceholder')}
          className="min-h-[120px]"
          {...register('free_text')}
        />
      </div>
    </div>
  );
}
