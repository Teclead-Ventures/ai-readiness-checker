'use client';

import React, { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { FeatureValue } from '@/types/survey';

interface FeatureItemProps {
  featureId: string;
  label: string;
  value: FeatureValue | undefined;
  onChange: (featureId: string, value: FeatureValue) => void;
}

const STATES = [
  { value: 0 as const, key: 'dontKnow', color: 'bg-red-500', activeRing: 'ring-red-500/30', activeBg: 'bg-red-500', activeText: 'text-white' },
  { value: 1 as const, key: 'knowIt', color: 'bg-amber-500', activeRing: 'ring-amber-500/30', activeBg: 'bg-amber-500', activeText: 'text-white' },
  { value: 2 as const, key: 'useIt', color: 'bg-green-500', activeRing: 'ring-green-500/30', activeBg: 'bg-green-500', activeText: 'text-white' },
] as const;

function FeatureItemInner({ featureId, label, value, onChange }: FeatureItemProps) {
  const t = useTranslations('survey.features');

  const handleSelect = useCallback(
    (val: FeatureValue) => {
      onChange(featureId, val);
    },
    [featureId, onChange],
  );

  return (
    <div className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:gap-4">
      <p className="flex-1 text-sm leading-snug text-foreground">{label}</p>
      <div className="inline-flex shrink-0 rounded-lg border border-border bg-muted/40 p-0.5">
        {STATES.map((state) => {
          const isActive = value === state.value;
          return (
            <button
              key={state.value}
              type="button"
              role="radio"
              aria-checked={isActive}
              aria-label={t(state.key)}
              onClick={() => handleSelect(state.value)}
              className={cn(
                'min-h-[44px] min-w-[44px] cursor-pointer rounded-md px-3 py-2 text-xs font-medium transition-all select-none',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                isActive
                  ? cn(state.activeBg, state.activeText, 'ring-2', state.activeRing, 'shadow-sm')
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted',
              )}
            >
              {t(state.key)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export const FeatureItem = React.memo(FeatureItemInner);
