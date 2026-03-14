'use client';

import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import type { SurveyFormData } from '@/types/survey';

interface LikertRowProps {
  questionKey: string;
  label: string;
  scaleLabels: string[];
  value: number;
  onChange: (val: number) => void;
}

function LikertRow({ label, scaleLabels, value, onChange }: LikertRowProps) {
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
                  ? 'border-[#FFAB54] bg-[#FFAB54]/10 ring-1 ring-[#FFAB54] text-foreground'
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
  const { setValue, watch } = useFormContext<SurveyFormData>();

  const km = watch('knowledge_management') ?? {
    awareness: 3,
    filtering: 3,
    contextualization: 3,
    overload: 3,
    knowledge_transfer: 3,
  };

  const scaleLabels = t.raw('scaleLabels') as string[];
  const overloadLabels = t.raw('overloadLabels') as string[];

  const setField = (field: keyof typeof km, val: number) => {
    setValue('knowledge_management', { ...km, [field]: val });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold">{t('title')}</h2>
        <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
      </div>

      <div className="space-y-6">
        <LikertRow
          questionKey="awareness"
          label={t('awareness')}
          scaleLabels={scaleLabels}
          value={km.awareness}
          onChange={(val) => setField('awareness', val)}
        />
        <LikertRow
          questionKey="filtering"
          label={t('filtering')}
          scaleLabels={scaleLabels}
          value={km.filtering}
          onChange={(val) => setField('filtering', val)}
        />
        <LikertRow
          questionKey="contextualization"
          label={t('contextualization')}
          scaleLabels={scaleLabels}
          value={km.contextualization}
          onChange={(val) => setField('contextualization', val)}
        />
        <LikertRow
          questionKey="overload"
          label={t('overload')}
          scaleLabels={overloadLabels}
          value={km.overload}
          onChange={(val) => setField('overload', val)}
        />
        <LikertRow
          questionKey="knowledge_transfer"
          label={t('knowledgeTransfer')}
          scaleLabels={scaleLabels}
          value={km.knowledge_transfer}
          onChange={(val) => setField('knowledge_transfer', val)}
        />
      </div>
    </div>
  );
}
