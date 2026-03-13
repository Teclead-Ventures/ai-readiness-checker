'use client';

import React, { useCallback } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { RESPONSE_SCALE } from '@/lib/features/types';
import type { FeatureEntry, FeatureValue, FeatureRelevance } from '@/types/survey';

interface FeatureItemProps {
  featureId: string;
  label: string;
  examples?: string;
  entry: FeatureEntry | undefined;
  onChange: (featureId: string, entry: FeatureEntry) => void;
}

const SCALE_ENTRIES = [
  { value: 0 as const, activeBg: 'bg-red-500', activeRing: 'ring-red-500/30', activeText: 'text-white' },
  { value: 1 as const, activeBg: 'bg-orange-500', activeRing: 'ring-orange-500/30', activeText: 'text-white' },
  { value: 2 as const, activeBg: 'bg-yellow-500', activeRing: 'ring-yellow-500/30', activeText: 'text-white' },
  { value: 3 as const, activeBg: 'bg-green-500', activeRing: 'ring-green-500/30', activeText: 'text-white' },
] as const;

const RELEVANCE_ENTRIES = [
  { value: 'yes' as const, activeBg: 'bg-blue-500', activeRing: 'ring-blue-500/30', activeText: 'text-white' },
  { value: 'unsure' as const, activeBg: 'bg-gray-400', activeRing: 'ring-gray-400/30', activeText: 'text-white' },
  { value: 'no' as const, activeBg: 'bg-slate-500', activeRing: 'ring-slate-500/30', activeText: 'text-white' },
] as const;

function FeatureItemInner({ featureId, label, examples, entry, onChange }: FeatureItemProps) {
  const locale = useLocale();
  const t = useTranslations('survey.features');
  const lang = (locale === 'de' ? 'de' : 'en') as 'en' | 'de';

  const handleScoreSelect = useCallback(
    (val: FeatureValue) => {
      onChange(featureId, { ...(entry ?? {}), score: val });
    },
    [featureId, entry, onChange],
  );

  const handleRelevanceSelect = useCallback(
    (val: FeatureRelevance) => {
      onChange(featureId, { ...(entry ?? {}), relevant: val });
    },
    [featureId, entry, onChange],
  );

  return (
    <div className="flex flex-col gap-2 py-3 sm:flex-row sm:items-start sm:gap-4">
      <div className="flex-1">
        <p className="text-sm leading-snug text-foreground">{label}</p>
        {examples && (
          <p className="mt-0.5 text-xs text-muted-foreground">{examples}</p>
        )}
      </div>

      <div className="flex shrink-0 flex-col gap-1.5">
        {/* Usage row */}
        <div className="flex items-center gap-2">
          <span className="w-16 shrink-0 text-right text-xs text-muted-foreground">
            {t('usageLabel')}
          </span>
          <div className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5">
            {SCALE_ENTRIES.map((scaleEntry) => {
              const isActive = entry?.score === scaleEntry.value;
              const scaleItem = RESPONSE_SCALE[scaleEntry.value];
              return (
                <button
                  key={scaleEntry.value}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  aria-label={scaleItem[lang]}
                  onClick={() => handleScoreSelect(scaleEntry.value)}
                  className={cn(
                    'min-h-[44px] min-w-[44px] cursor-pointer rounded-md px-3 py-2 text-xs font-medium transition-all select-none',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    isActive
                      ? cn(scaleEntry.activeBg, scaleEntry.activeText, 'ring-2', scaleEntry.activeRing, 'shadow-sm')
                      : 'bg-gray-100 text-[#444D69] hover:text-foreground hover:bg-muted',
                  )}
                >
                  {scaleItem[lang]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Relevance row */}
        <div className="flex items-center gap-2">
          <span className="w-16 shrink-0 text-right text-xs text-muted-foreground">
            {t('relevanceLabel')}
          </span>
          <div className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5">
            {RELEVANCE_ENTRIES.map((relEntry) => {
              const isActive = entry?.relevant === relEntry.value;
              const labelKey =
                relEntry.value === 'yes' ? 'relevanceYes' :
                relEntry.value === 'unsure' ? 'relevanceUnsure' : 'relevanceNo';
              return (
                <button
                  key={relEntry.value}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  onClick={() => handleRelevanceSelect(relEntry.value)}
                  className={cn(
                    'min-h-[36px] cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-all select-none',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    isActive
                      ? cn(relEntry.activeBg, relEntry.activeText, 'ring-2', relEntry.activeRing, 'shadow-sm')
                      : 'bg-gray-100 text-[#444D69] hover:text-foreground hover:bg-muted',
                  )}
                >
                  {t(labelKey)}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export const FeatureItem = React.memo(FeatureItemInner);
