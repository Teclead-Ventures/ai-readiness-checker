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
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{t('step', { current: currentStep, total: totalSteps })}</span>
        <span className="tabular-nums font-medium text-primary">{percentage}%</span>
      </div>
      <div className="relative h-0.5 w-full overflow-hidden rounded-full bg-border">
        <div
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
