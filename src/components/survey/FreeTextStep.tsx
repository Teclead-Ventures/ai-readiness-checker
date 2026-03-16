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

export function FreeTextStep({ track: _track }: FreeTextStepProps) {
  const t = useTranslations('survey.postAssessment');
  const locale = useLocale();
  const { control } = useFormContext<SurveyFormData>();

  const lang = (locale === 'de' ? 'de' : 'en') as 'en' | 'de';

  const tierOptions = ([1, 2, 3, 4, 5] as const).map((tier) => ({
    key: `tier_${tier}`,
    name: `Tier ${tier} — ${TIER_CONFIG[tier][lang]}`,
  }));

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">{t('title')}</h2>

      {/* Top Impact Tiers (select up to 3) */}
      <FormField
        control={control}
        name="top_impact_categories"
        render={({ field }) => {
          const selected: string[] = field.value ?? [];
          return (
            <FormItem>
              <FormLabel className="text-base font-medium">{t('topCategories')}</FormLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {tierOptions.map(({ key, name }) => {
                  const checked = selected.includes(key);
                  const atLimit = selected.length >= 3 && !checked;
                  return (
                    <label
                      key={key}
                      className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors min-h-[44px] ${
                        atLimit ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted/50'
                      } ${checked ? 'border-[#FFAB54] bg-[#FFAB54]/5' : ''}`}
                    >
                      <Checkbox
                        checked={checked}
                        disabled={atLimit}
                        onCheckedChange={(isChecked) => {
                          if (isChecked && selected.length < 3) {
                            field.onChange([...selected, key]);
                          } else if (!isChecked) {
                            field.onChange(selected.filter((c) => c !== key));
                          }
                        }}
                      />
                      <span className="text-sm">{name}</span>
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
                className="min-h-[120px] rounded-lg border-gray-300 px-4 py-3 focus:ring-[#FFAB54] focus:border-[#FFAB54]"
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
