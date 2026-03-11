'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslations, useLocale } from 'next-intl';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DEV_FEATURES } from '@/lib/features/dev-features';
import { BUSINESS_FEATURES } from '@/lib/features/business-features';
import { FeatureItem } from './FeatureItem';
import type { FeatureValue, FeatureData, SurveyFormData, Track } from '@/types/survey';

interface FeatureMatrixStepProps {
  track: Track;
}

interface CategorySectionProps {
  categoryKey: string;
  categoryName: string;
  items: { id: string; label: string }[];
  features: Record<string, FeatureValue>;
  onFeatureChange: (featureId: string, value: FeatureValue) => void;
  defaultExpanded: boolean;
}

function computeCategoryScore(
  items: { id: string }[],
  features: Record<string, FeatureValue>,
): { answered: number; total: number; score: number } {
  let answered = 0;
  let sum = 0;
  const total = items.length;

  for (const item of items) {
    const val = features[item.id];
    if (val !== undefined && val !== null) {
      answered++;
      sum += val;
    }
  }

  // Score: each item max 2, so percentage = sum / (total * 2) * 100
  const score = total > 0 ? Math.round((sum / (total * 2)) * 100) : 0;
  return { answered, total, score };
}

function scoreToColor(score: number): string {
  if (score <= 25) return 'bg-red-500';
  if (score <= 50) return 'bg-amber-500';
  if (score <= 75) return 'bg-yellow-400';
  return 'bg-green-500';
}

function CategorySection({
  categoryKey,
  categoryName,
  items,
  features,
  onFeatureChange,
  defaultExpanded,
}: CategorySectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const t = useTranslations('survey.features');

  const { answered, total, score } = useMemo(
    () => computeCategoryScore(items, features),
    [items, features],
  );

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50"
        aria-expanded={expanded}
      >
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-muted-foreground transition-transform',
            expanded && 'rotate-180',
          )}
        />
        <div className="flex flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
          <span className="text-sm font-semibold text-foreground">
            {categoryKey}. {categoryName}
          </span>
          <span className="text-xs text-muted-foreground">
            {answered}/{total}
          </span>
        </div>
        <span className="shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
          {score}%
        </span>
      </button>

      {/* Score bar */}
      <div className="h-1 w-full bg-muted">
        <div
          className={cn('h-full transition-all duration-300', scoreToColor(score))}
          style={{ width: `${score}%` }}
        />
      </div>

      {expanded && (
        <div className="divide-y divide-border/50 px-4">
          {items.map((item) => (
            <FeatureItem
              key={item.id}
              featureId={item.id}
              label={item.label}
              value={features[item.id]}
              onChange={onFeatureChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FeatureMatrixStep({ track }: FeatureMatrixStepProps) {
  const t = useTranslations('survey.features');
  const locale = useLocale();
  const { setValue } = useFormContext<SurveyFormData>();

  const featureData: FeatureData = track === 'dev' ? DEV_FEATURES : BUSINESS_FEATURES;
  const features: Record<string, FeatureValue> =
    useWatch<SurveyFormData, 'features'>({ name: 'features' }) ?? {};

  const lang = (locale === 'de' ? 'de' : 'en') as 'en' | 'de';

  // Build flat list of all feature ids for progress count
  const allItems = useMemo(() => {
    const result: string[] = [];
    for (const cat of Object.values(featureData)) {
      for (const item of cat.items) {
        result.push(item.id);
      }
    }
    return result;
  }, [featureData]);

  const answeredCount = useMemo(
    () => allItems.filter((id) => features[id] !== undefined && features[id] !== null).length,
    [allItems, features],
  );

  const handleFeatureChange = useCallback(
    (featureId: string, value: FeatureValue) => {
      setValue(`features.${featureId}`, value, { shouldDirty: true, shouldValidate: true });
    },
    [setValue],
  );

  const categoryEntries = useMemo(
    () =>
      Object.entries(featureData).map(([key, cat]) => ({
        key,
        name: cat.name[lang],
        items: cat.items.map((item) => ({
          id: item.id,
          label: item[lang],
        })),
      })),
    [featureData, lang],
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">{t('title')}</h2>
        <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${allItems.length > 0 ? (answeredCount / allItems.length) * 100 : 0}%` }}
          />
        </div>
        <span className="shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
          {t('progress', { count: answeredCount, total: allItems.length })}
        </span>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-red-500" />
          {t('dontKnow')}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-amber-500" />
          {t('knowIt')}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-green-500" />
          {t('useIt')}
        </span>
      </div>

      {/* Categories */}
      <div className="flex flex-col gap-3">
        {categoryEntries.map((cat) => (
          <CategorySection
            key={cat.key}
            categoryKey={cat.key}
            categoryName={cat.name}
            items={cat.items}
            features={features}
            onFeatureChange={handleFeatureChange}
            defaultExpanded={true}
          />
        ))}
      </div>
    </div>
  );
}
