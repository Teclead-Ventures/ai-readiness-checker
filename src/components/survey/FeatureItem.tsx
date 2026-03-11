'use client';

import React, { useCallback } from 'react';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import { RESPONSE_SCALE } from '@/lib/features/types';
import type { FeatureValue } from '@/types/survey';

interface FeatureItemProps {
  featureId: string;
  label: string;
  examples?: string;
  value: FeatureValue | undefined;
  onChange: (featureId: string, value: FeatureValue) => void;
}

const SCALE_ENTRIES = [
  { value: 0 as const, activeBg: 'bg-red-500', activeRing: 'ring-red-500/30', activeText: 'text-white' },
  { value: 1 as const, activeBg: 'bg-orange-500', activeRing: 'ring-orange-500/30', activeText: 'text-white' },
  { value: 2 as const, activeBg: 'bg-yellow-500', activeRing: 'ring-yellow-500/30', activeText: 'text-white' },
  { value: 3 as const, activeBg: 'bg-green-500', activeRing: 'ring-green-500/30', activeText: 'text-white' },
] as const;

function FeatureItemInner({ featureId, label, examples, value, onChange }: FeatureItemProps) {
  const locale = useLocale();
  const lang = (locale === 'de' ? 'de' : 'en') as 'en' | 'de';

  const handleSelect = useCallback(
    (val: FeatureValue) => {
      onChange(featureId, val);
    },
    [featureId, onChange],
  );

  return (
    <div className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex-1">
        <p className="text-sm leading-snug text-foreground">{label}</p>
        {examples && (
          <p className="mt-0.5 text-xs text-muted-foreground">{examples}</p>
        )}
      </div>
      <div className="inline-flex shrink-0 rounded-lg border border-border bg-muted/40 p-0.5">
        {SCALE_ENTRIES.map((entry) => {
          const isActive = value === entry.value;
          const scaleItem = RESPONSE_SCALE[entry.value];
          return (
            <button
              key={entry.value}
              type="button"
              role="radio"
              aria-checked={isActive}
              aria-label={scaleItem[lang]}
              onClick={() => handleSelect(entry.value)}
              className={cn(
                'min-h-[44px] min-w-[44px] cursor-pointer rounded-md px-3 py-2 text-xs font-medium transition-all select-none',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                isActive
                  ? cn(entry.activeBg, entry.activeText, 'ring-2', entry.activeRing, 'shadow-sm')
                  : 'bg-gray-100 text-[#444D69] hover:text-foreground hover:bg-muted',
              )}
            >
              {scaleItem[lang]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export const FeatureItem = React.memo(FeatureItemInner);
