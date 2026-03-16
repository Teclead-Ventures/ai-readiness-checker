'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { Track, SurveyFormData } from '@/types/survey';
import { TIER_CONFIG } from '@/lib/features/types';

interface FreeTextStepProps {
  track: Track;
}

/** Visual accent per tier — consistent with FeatureMatrixStep */
const TIER_ACCENT = {
  1: 'border-blue-300 bg-blue-50 data-[checked]:border-blue-400 data-[checked]:bg-blue-50',
  2: 'border-teal-300 bg-teal-50 data-[checked]:border-teal-400 data-[checked]:bg-teal-50',
  3: 'border-green-300 bg-green-50 data-[checked]:border-green-400 data-[checked]:bg-green-50',
  4: 'border-orange-300 bg-orange-50 data-[checked]:border-orange-400 data-[checked]:bg-orange-50',
  5: 'border-purple-300 bg-purple-50 data-[checked]:border-purple-400 data-[checked]:bg-purple-50',
} as const;

const TIER_BADGE = {
  1: 'bg-blue-100 text-blue-700',
  2: 'bg-teal-100 text-teal-700',
  3: 'bg-green-100 text-green-700',
  4: 'bg-orange-100 text-orange-700',
  5: 'bg-purple-100 text-purple-700',
} as const;

export function FreeTextStep({ track }: FreeTextStepProps) {
  const t = useTranslations('survey.postAssessment');
  const locale = useLocale();
  const { register, setValue, watch } = useFormContext<SurveyFormData>();

  const topCategories = watch('top_impact_categories') || [];
  const lang = (locale === 'de' ? 'de' : 'en') as 'en' | 'de';

  const tierOptions = ([1, 2, 3, 4, 5] as const).map((tier) => ({
    key: `tier_${tier}` as string,
    tier,
    name: TIER_CONFIG[tier][lang],
  }));

  const atLeastOneSelected = topCategories.length >= 1;

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">{t('title')}</h2>

      {/* Top Impact Tiers — select at least 1, no upper limit */}
      <div className="space-y-3">
        <div className="space-y-0.5">
          <Label className="text-base font-medium">{t('topCategories')}</Label>
          {!atLeastOneSelected && (
            <p className="text-xs text-amber-600">{t('topCategoriesHint')}</p>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {tierOptions.map(({ key, tier, name }) => {
            const checked = topCategories.includes(key);
            return (
              <label
                key={key}
                data-checked={checked || undefined}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all min-h-[44px] hover:shadow-sm ${
                  checked
                    ? 'border-[#FFAB54] bg-[#FFAB54]/5 shadow-sm'
                    : 'border-border hover:bg-muted/50'
                }`}
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={(isChecked) => {
                    if (isChecked) {
                      setValue('top_impact_categories', [...topCategories, key]);
                    } else {
                      setValue(
                        'top_impact_categories',
                        topCategories.filter((c) => c !== key),
                      );
                    }
                  }}
                />
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${TIER_BADGE[tier]}`}>
                    T{tier}
                  </span>
                  <span className="text-sm truncate">{name}</span>
                </div>
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
          className="min-h-[120px] rounded-lg border-gray-300 px-4 py-3 focus:ring-[#FFAB54] focus:border-[#FFAB54]"
          {...register('free_text')}
        />
      </div>
    </div>
  );
}
