'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
import { BARRIERS as BARRIERS_LIST, type SurveyFormData, type Track } from '@/types/survey';

interface MindsetStepProps {
  track: Track;
}

export function MindsetStep({ track: _track }: MindsetStepProps) {
  const t = useTranslations('survey.mindset');
  const locale = useLocale();
  const { control } = useFormContext<SurveyFormData>();

  const opennessLevels = t.raw('opennessLevels') as string[];
  const barrierLabels = t.raw('barrierLabels') as Record<string, string>;
  const lang = (locale === 'de' ? 'de' : 'en') as 'en' | 'de';

  const tierOptions = ([1, 2, 3, 4, 5] as const).map((tier) => ({
    key: `tier_${tier}`,
    name: `${TIER_CONFIG[tier][lang]}`,
  }));

  return (
    <div className="space-y-8">
      <h2 className="text-[1.875rem] font-bold font-display">{t('title')}</h2>

      {/* Openness (1–5 scale) */}
      <FormField
        control={control}
        name="openness"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-medium">{t('openness')}</FormLabel>
            <FormControl>
              <RadioGroup
                value={String(field.value)}
                onValueChange={(val) => field.onChange(Number(val))}
                className="flex flex-wrap gap-2"
              >
                {opennessLevels.map((label, index) => {
                  const value = index + 1;
                  const isSelected = field.value === value;
                  return (
                    <label
                      key={value}
                      className={`flex items-center gap-2 px-4 py-3 rounded-lg border border-border bg-card cursor-pointer transition-colors min-h-[2.75rem] ${
                        isSelected
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'hover:bg-card/80'
                      }`}
                    >
                      <RadioGroupItem value={String(value)} />
                      <span className="text-sm font-medium">{label}</span>
                    </label>
                  );
                })}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Barriers */}
      <FormField
        control={control}
        name="barriers"
        render={({ field }) => {
          const selected: string[] = field.value ?? [];
          const showOtherField = selected.includes('Other');
          return (
            <FormItem>
              <FormLabel className="text-base font-medium">{t('barriers')}</FormLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {BARRIERS_LIST.map((barrier) => {
                  const checked = selected.includes(barrier);
                  const displayLabel = barrierLabels[barrier] ?? barrier;
                  return (
                    <label
                      key={barrier}
                      className="flex items-center gap-2 p-3 rounded-lg border border-border bg-card cursor-pointer hover:bg-card/80 transition-colors min-h-[2.75rem]"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(isChecked) =>
                          field.onChange(
                            isChecked
                              ? [...selected, barrier]
                              : selected.filter((b) => b !== barrier),
                          )
                        }
                      />
                      <span className="text-sm">{displayLabel}</span>
                    </label>
                  );
                })}
              </div>
              <FormMessage />

              {/* Free text for "Other" */}
              {showOtherField && (
                <FormField
                  control={control}
                  name="barriers_other"
                  render={({ field: otherField }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          rows={2}
                          placeholder={t('barriersOtherPlaceholder')}
                          className="mt-2 resize-none"
                          {...otherField}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </FormItem>
          );
        }}
      />

      {/* Priority Areas (top 3) */}
      <FormField
        control={control}
        name="priority_areas"
        render={({ field }) => {
          const selected: string[] = field.value ?? [];
          return (
            <FormItem>
              <FormLabel className="text-base font-medium">{t('priorityAreas')}</FormLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {tierOptions.map(({ key, name }) => {
                  const checked = selected.includes(key);
                  const atLimit = selected.length >= 3 && !checked;
                  return (
                    <label
                      key={key}
                      className={`flex items-center gap-2 p-3 rounded-lg border border-border bg-card cursor-pointer transition-colors min-h-[2.75rem] ${
                        atLimit ? 'opacity-50 cursor-not-allowed' : 'hover:bg-card/80'
                      } ${checked ? 'border-primary bg-primary/5' : ''}`}
                    >
                      <Checkbox
                        checked={checked}
                        disabled={atLimit}
                        onCheckedChange={(isChecked) => {
                          if (isChecked && selected.length < 3) {
                            field.onChange([...selected, key]);
                          } else if (!isChecked) {
                            field.onChange(selected.filter((a) => a !== key));
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
    </div>
  );
}
