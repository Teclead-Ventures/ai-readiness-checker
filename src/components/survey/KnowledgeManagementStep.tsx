'use client';

import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import type { SurveyFormData } from '@/types/survey';

function LikertRow({
  label,
  scaleLabels,
  value,
  onChange,
}: {
  label: string;
  scaleLabels: string[];
  value: number;
  onChange: (val: number) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <div className="flex flex-wrap gap-2">
        {scaleLabels.map((scaleLabel, index) => {
          const val = index + 1;
          const isSelected = value === val;
          return (
            <button
              key={val}
              type="button"
              onClick={() => onChange(val)}
              className={`flex-1 min-w-[60px] cursor-pointer rounded-lg border px-3 py-2.5 text-xs font-medium transition-all select-none min-h-[44px] ${
                isSelected
                  ? 'border-primary bg-primary/10 ring-1 ring-primary/50 text-foreground'
                  : 'hover:bg-muted/50 text-muted-foreground'
              }`}
            >
              <span className="block text-center leading-tight">{scaleLabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function KnowledgeManagementStep() {
  const t = useTranslations('survey.knowledgeManagement');
  const { control } = useFormContext<SurveyFormData>();

  const scaleLabels = t.raw('scaleLabels') as string[];
  const overloadLabels = t.raw('overloadLabels') as string[];

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold">{t('title')}</h2>
        <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
      </div>

      <div className="space-y-6">
        <FormField
          control={control}
          name="knowledge_management.awareness"
          render={({ field }) => (
            <FormItem>
              <LikertRow
                label={t('awareness')}
                scaleLabels={scaleLabels}
                value={field.value}
                onChange={field.onChange}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="knowledge_management.filtering"
          render={({ field }) => (
            <FormItem>
              <LikertRow
                label={t('filtering')}
                scaleLabels={scaleLabels}
                value={field.value}
                onChange={field.onChange}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="knowledge_management.contextualization"
          render={({ field }) => (
            <FormItem>
              <LikertRow
                label={t('contextualization')}
                scaleLabels={scaleLabels}
                value={field.value}
                onChange={field.onChange}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="knowledge_management.overload"
          render={({ field }) => (
            <FormItem>
              <LikertRow
                label={t('overload')}
                scaleLabels={overloadLabels}
                value={field.value}
                onChange={field.onChange}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="knowledge_management.knowledge_transfer"
          render={({ field }) => (
            <FormItem>
              <LikertRow
                label={t('knowledgeTransfer')}
                scaleLabels={scaleLabels}
                value={field.value}
                onChange={field.onChange}
              />
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
