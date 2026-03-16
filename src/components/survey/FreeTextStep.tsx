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

/** Visual accent per tier — dark mode, consistent with FeatureMatrixStep */
const TIER_ACCENT = {
  1: 'border-blue-500/30 bg-blue-500/10 data-[checked]:border-blue-400 data-[checked]:bg-blue-500/15',
  2: 'border-teal-500/30 bg-teal-500/10 data-[checked]:border-teal-400 data-[checked]:bg-teal-500/15',
  3: 'border-green-500/30 bg-green-500/10 data-[checked]:border-green-400 data-[checked]:bg-green-500/15',
  4: 'border-primary/30 bg-primary/10 data-[checked]:border-primary data-[checked]:bg-primary/15',
  5: 'border-purple-500/30 bg-purple-500/10 data-[checked]:border-purple-400 data-[checked]:bg-purple-500/15',
} as const;

const TIER_BADGE = {
  1: 'bg-blue-500/15 text-blue-300',
  2: 'bg-teal-500/15 text-teal-300',
  3: 'bg-green-500/15 text-green-300',
  4: 'bg-primary/15 text-primary',
  5: 'bg-purple-500/15 text-purple-300',
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
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all min-h-[44px] ${
                  checked
                    ? 'border-primary/60 bg-primary/10 shadow-sm shadow-primary/10'
                    : 'border-border bg-card hover:border-border/80 hover:bg-secondary/50'
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
          className="min-h-[120px] rounded-lg bg-card border-border px-4 py-3 focus-visible:ring-primary focus-visible:border-primary placeholder:text-muted-foreground/40"
          {...register('free_text')}
        />
      </div>
    </div>
  );
}
