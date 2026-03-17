'use client';

import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import type { FieldPath } from 'react-hook-form';
import { Checkbox } from '@/components/ui/checkbox';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BUSINESS_CONTEXTS,
  BUSINESS_TOOLS,
  DEV_CONFIG,
  DEV_MODES,
  DEV_TOOLS,
  FREQUENCIES,
  type SurveyFormData,
  type Track,
} from '@/types/survey';

interface CurrentUsageStepProps {
  track: Track;
}

function CheckboxGroup({
  items,
  selected,
  onChange,
}: {
  items: readonly string[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {items.map((item) => (
        <label
          key={item}
          className="flex items-center gap-2 p-3 rounded-lg border border-border bg-card cursor-pointer hover:bg-card/80 transition-colors min-h-[2.75rem]"
        >
          <Checkbox
            checked={selected.includes(item)}
            onCheckedChange={(checked) =>
              onChange(
                checked
                  ? [...selected, item]
                  : selected.filter((s) => s !== item),
              )
            }
          />
          <span className="text-sm">{item}</span>
        </label>
      ))}
    </div>
  );
}

export function CurrentUsageStep({ track }: CurrentUsageStepProps) {
  const t = useTranslations('survey.currentUsage');
  const { control } = useFormContext<SurveyFormData>();

  const toolOptions = track === 'dev' ? DEV_TOOLS : BUSINESS_TOOLS;

  return (
    <div className="space-y-8">
      <h2 className="text-xl sm:text-[1.875rem] font-bold font-display hyphens-auto">{t('title')}</h2>

      {/* Tools */}
      <FormField
        control={control}
        name="current_usage.tools"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-medium">{t('tools')}</FormLabel>
            <CheckboxGroup
              items={toolOptions}
              selected={(field.value as string[]) ?? []}
              onChange={field.onChange}
            />
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Dev: Modes */}
      {track === 'dev' && (
        <FormField
          control={control}
          name={'current_usage.modes' as FieldPath<SurveyFormData>}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">{t('modes')}</FormLabel>
              <CheckboxGroup
                items={DEV_MODES}
                selected={(field.value as string[]) ?? []}
                onChange={field.onChange}
              />
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Business: Contexts */}
      {track === 'business' && (
        <FormField
          control={control}
          name={'current_usage.usage_contexts' as FieldPath<SurveyFormData>}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">{t('contexts')}</FormLabel>
              <CheckboxGroup
                items={BUSINESS_CONTEXTS}
                selected={(field.value as string[]) ?? []}
                onChange={field.onChange}
              />
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Frequency */}
      <FormField
        control={control}
        name="current_usage.frequency"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-medium">{t('frequency')}</FormLabel>
            <Select value={(field.value as string) ?? ''} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger className="w-full h-11">
                  <SelectValue placeholder={t('frequencyPlaceholder')} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {FREQUENCIES.map((freq) => (
                  <SelectItem key={freq} value={freq}>
                    {t(`frequencyOptions.${freq}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Dev: Config */}
      {track === 'dev' && (
        <FormField
          control={control}
          name={'current_usage.config_items' as FieldPath<SurveyFormData>}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">{t('config')}</FormLabel>
              <CheckboxGroup
                items={DEV_CONFIG}
                selected={(field.value as string[]) ?? []}
                onChange={field.onChange}
              />
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}
