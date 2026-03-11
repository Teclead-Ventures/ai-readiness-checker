'use client';

import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import {
  DEV_TOOLS,
  DEV_MODES,
  DEV_CONFIG,
  BUSINESS_TOOLS,
  BUSINESS_CONTEXTS,
  FREQUENCIES,
  type Track,
  type SurveyFormData,
} from '@/types/survey';

interface CurrentUsageStepProps {
  track: Track;
}

function MultiSelect({
  items,
  selected,
  onChange,
}: {
  items: readonly string[];
  selected: string[];
  onChange: (items: string[]) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {items.map((item) => {
        const checked = selected.includes(item);
        return (
          <label
            key={item}
            className="flex items-center gap-2 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors min-h-[44px]"
          >
            <Checkbox
              checked={checked}
              onCheckedChange={(isChecked) => {
                if (isChecked) {
                  onChange([...selected, item]);
                } else {
                  onChange(selected.filter((s) => s !== item));
                }
              }}
            />
            <span className="text-sm">{item}</span>
          </label>
        );
      })}
    </div>
  );
}

export function CurrentUsageStep({ track }: CurrentUsageStepProps) {
  const t = useTranslations('survey.currentUsage');
  const { setValue, watch } = useFormContext<SurveyFormData>();

  const tools = (watch('current_usage.tools') as string[]) || [];
  const frequency = (watch('current_usage.frequency') as string) || undefined;

  // Dev-specific
  const modes = track === 'dev'
    ? ((watch('current_usage.modes' as 'current_usage') as unknown as string[]) || [])
    : [];
  const configItems = track === 'dev'
    ? ((watch('current_usage.config_items' as 'current_usage') as unknown as string[]) || [])
    : [];

  // Business-specific
  const contexts = track === 'business'
    ? ((watch('current_usage.usage_contexts' as 'current_usage') as unknown as string[]) || [])
    : [];

  const toolOptions = track === 'dev' ? DEV_TOOLS : BUSINESS_TOOLS;

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">{t('title')}</h2>

      {/* Tools */}
      <div className="space-y-3">
        <Label className="text-base font-medium">{t('tools')}</Label>
        <MultiSelect
          items={toolOptions}
          selected={tools}
          onChange={(val) => setValue('current_usage.tools', val)}
        />
      </div>

      {/* Dev: Modes */}
      {track === 'dev' && (
        <div className="space-y-3">
          <Label className="text-base font-medium">{t('modes')}</Label>
          <MultiSelect
            items={DEV_MODES}
            selected={modes}
            onChange={(val) =>
              setValue('current_usage.modes' as 'current_usage', val as unknown as SurveyFormData['current_usage'])
            }
          />
        </div>
      )}

      {/* Business: Contexts */}
      {track === 'business' && (
        <div className="space-y-3">
          <Label className="text-base font-medium">{t('contexts')}</Label>
          <MultiSelect
            items={BUSINESS_CONTEXTS}
            selected={contexts}
            onChange={(val) =>
              setValue('current_usage.usage_contexts' as 'current_usage', val as unknown as SurveyFormData['current_usage'])
            }
          />
        </div>
      )}

      {/* Frequency */}
      <div className="space-y-2">
        <Label className="text-base font-medium">{t('frequency')}</Label>
        <Select
          value={frequency}
          onValueChange={(val) => setValue('current_usage.frequency', val ?? '')}
        >
          <SelectTrigger className="w-full h-11">
            <SelectValue placeholder={t('frequencyPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            {FREQUENCIES.map((freq) => (
              <SelectItem key={freq} value={freq}>
                {freq}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Dev: Config */}
      {track === 'dev' && (
        <div className="space-y-3">
          <Label className="text-base font-medium">{t('config')}</Label>
          <MultiSelect
            items={DEV_CONFIG}
            selected={configItems}
            onChange={(val) =>
              setValue('current_usage.config_items' as 'current_usage', val as unknown as SurveyFormData['current_usage'])
            }
          />
        </div>
      )}
    </div>
  );
}
