'use client';

import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { useLocale } from 'next-intl';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { BARRIERS, type Track, type SurveyFormData } from '@/types/survey';
import { TIER_CONFIG } from '@/lib/features/types';

interface MindsetStepProps {
  track: Track;
}

export function MindsetStep({ track }: MindsetStepProps) {
  const t = useTranslations('survey.mindset');
  const locale = useLocale();
  const { setValue, watch } = useFormContext<SurveyFormData>();

  const openness = watch('openness') ?? 3;
  const barriers = watch('barriers') || [];
  const priorityAreas = watch('priority_areas') || [];

  const opennessLevels = t.raw('opennessLevels') as string[];
  const lang = (locale === 'de' ? 'de' : 'en') as 'en' | 'de';

  const tierOptions = ([1, 2, 3, 4, 5] as const).map((tier) => ({
    key: `tier_${tier}`,
    name: `Tier ${tier} — ${TIER_CONFIG[tier][lang]} (${TIER_CONFIG[tier].era})`,
  }));

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">{t('title')}</h2>

      {/* Openness (1-5 scale) */}
      <div className="space-y-4">
        <Label className="text-base font-medium">{t('openness')}</Label>
        <RadioGroup
          value={String(openness)}
          onValueChange={(val) => setValue('openness', Number(val))}
          className="flex flex-wrap gap-2"
        >
          {opennessLevels.map((label, index) => {
            const value = index + 1;
            const isSelected = openness === value;
            return (
              <label
                key={value}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border cursor-pointer transition-colors min-h-[44px] ${
                  isSelected
                    ? 'border-[#FFAB54] bg-[#FFAB54]/5 ring-1 ring-[#FFAB54]'
                    : 'hover:bg-muted/50'
                }`}
              >
                <RadioGroupItem value={String(value)} />
                <span className="text-sm font-medium">{label}</span>
              </label>
            );
          })}
        </RadioGroup>
      </div>

      {/* Barriers */}
      <div className="space-y-3">
        <Label className="text-base font-medium">{t('barriers')}</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {BARRIERS.map((barrier) => {
            const checked = barriers.includes(barrier);
            return (
              <label
                key={barrier}
                className="flex items-center gap-2 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors min-h-[44px]"
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={(isChecked) => {
                    if (isChecked) {
                      setValue('barriers', [...barriers, barrier]);
                    } else {
                      setValue('barriers', barriers.filter((b) => b !== barrier));
                    }
                  }}
                />
                <span className="text-sm">{barrier}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Priority Areas (top 3) */}
      <div className="space-y-3">
        <Label className="text-base font-medium">
          {t('priorityAreas')}
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {tierOptions.map(({ key, name }) => {
            const checked = priorityAreas.includes(key);
            const atLimit = priorityAreas.length >= 3 && !checked;
            return (
              <label
                key={key}
                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors min-h-[44px] ${
                  atLimit
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-muted/50'
                } ${checked ? 'border-[#FFAB54] bg-[#FFAB54]/5' : ''}`}
              >
                <Checkbox
                  checked={checked}
                  disabled={atLimit}
                  onCheckedChange={(isChecked) => {
                    if (isChecked && priorityAreas.length < 3) {
                      setValue('priority_areas', [...priorityAreas, key]);
                    } else if (!isChecked) {
                      setValue('priority_areas', priorityAreas.filter((a) => a !== key));
                    }
                  }}
                />
                <span className="text-sm">{name}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
