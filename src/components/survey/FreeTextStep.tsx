'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { TIER_CONFIG } from '@/lib/features/types';
import type { SurveyFormData, Track } from '@/types/survey';

interface FreeTextStepProps {
  track: Track;
}

/** Visual badge color per tier */
const TIER_BADGE = {
  1: 'bg-blue-500/15 text-blue-600',
  2: 'bg-teal-500/15 text-teal-600',
  3: 'bg-green-500/15 text-green-600',
  4: 'bg-primary/15 text-primary',
  5: 'bg-purple-500/15 text-purple-600',
} as const;

export function FreeTextStep({ track: _track }: FreeTextStepProps) {
  const t = useTranslations('survey.postAssessment');
  const locale = useLocale();
  const { control } = useFormContext<SurveyFormData>();

  const lang = (locale === 'de' ? 'de' : 'en') as 'en' | 'de';

  const tierOptions = ([1, 2, 3, 4, 5] as const).map((tier) => ({
    key: `tier_${tier}` as string,
    tier,
    name: TIER_CONFIG[tier][lang],
  }));

  return (
    <div className="space-y-8">
      <h2 className="text-[1.875rem] font-bold font-display">{t('title')}</h2>

      {/* Top Impact Tiers — select at least 1 */}
      <FormField
        control={control}
        name="top_impact_categories"
        render={({ field }) => {
          const selected: string[] = field.value ?? [];
          const atLeastOneSelected = selected.length >= 1;
          return (
            <FormItem>
              <div className="space-y-0.5">
                <FormLabel className="text-base font-medium">{t('topCategories')}</FormLabel>
                {!atLeastOneSelected && (
                  <p className="text-xs text-amber-600">{t('topCategoriesHint')}</p>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {tierOptions.map(({ key, tier, name }) => {
                  const checked = selected.includes(key);
                  return (
                    <label
                      key={key}
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
                            field.onChange([...selected, key]);
                          } else {
                            field.onChange(selected.filter((c) => c !== key));
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
              <FormMessage />
            </FormItem>
          );
        }}
      />

      {/* Free text */}
      <FormField
        control={control}
        name="free_text"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-medium">{t('freeText')}</FormLabel>
            <FormControl>
              <Textarea
                placeholder={t('freeTextPlaceholder')}
                className="min-h-[120px] rounded-lg border-border bg-card px-4 py-3 focus-visible:ring-primary focus-visible:border-primary placeholder:text-muted-foreground/40"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
