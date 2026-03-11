'use client';

import { useTranslations } from 'next-intl';

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function StepProgress({ currentStep, totalSteps }: StepProgressProps) {
  const t = useTranslations('survey');
  const percentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-sm text-[#444D69]">
        <span>{t('step', { current: currentStep, total: totalSteps })}</span>
        <span className="tabular-nums">{percentage}%</span>
      </div>
      <div className="relative h-1 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-[#121212] transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
