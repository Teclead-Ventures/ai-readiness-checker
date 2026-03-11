'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslations, useLocale } from 'next-intl';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DEV_CAPABILITIES } from '@/lib/features/dev-features';
import { BUSINESS_CAPABILITIES } from '@/lib/features/business-features';
import { TIER_CONFIG, RESPONSE_SCALE, Capability } from '@/lib/features/types';
import { FeatureItem } from './FeatureItem';
import type { FeatureValue, SurveyFormData, Track } from '@/types/survey';

interface FeatureMatrixStepProps {
  track: Track;
}

interface TierSectionProps {
  tier: 1 | 2 | 3 | 4 | 5;
  tierName: string;
  era: string;
  capabilities: { id: string; label: string; examples: string }[];
  features: Record<string, FeatureValue>;
  onFeatureChange: (featureId: string, value: FeatureValue) => void;
  defaultExpanded: boolean;
}

function computeTierScore(
  capabilities: { id: string }[],
  features: Record<string, FeatureValue>,
): { answered: number; total: number; score: number } {
  let answered = 0;
  let sum = 0;
  const total = capabilities.length;

  for (const cap of capabilities) {
    const val = features[cap.id];
    if (val !== undefined && val !== null) {
      answered++;
      sum += val;
    }
  }

  // Score: each item max 3, so percentage = sum / (total * 3) * 100
  const score = total > 0 ? Math.round((sum / (total * 3)) * 100) : 0;
  return { answered, total, score };
}

function scoreToColor(score: number): string {
  if (score <= 25) return 'bg-red-500';
  if (score <= 50) return 'bg-orange-500';
  if (score <= 75) return 'bg-yellow-400';
  return 'bg-green-500';
}

function TierSection({
  tier,
  tierName,
  era,
  capabilities,
  features,
  onFeatureChange,
  defaultExpanded,
}: TierSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const { answered, total, score } = useMemo(
    () => computeTierScore(capabilities, features),
    [capabilities, features],
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
            Tier {tier} — {tierName} ({era})
          </span>
          <span className="text-xs text-muted-foreground">
            {answered}/{total} done
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
          {capabilities.map((cap) => (
            <FeatureItem
              key={cap.id}
              featureId={cap.id}
              label={cap.label}
              examples={cap.examples}
              value={features[cap.id]}
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

  const capabilities: Capability[] = track === 'dev' ? DEV_CAPABILITIES : BUSINESS_CAPABILITIES;
  const features: Record<string, FeatureValue> =
    useWatch<SurveyFormData, 'features'>({ name: 'features' }) ?? {};

  const lang = (locale === 'de' ? 'de' : 'en') as 'en' | 'de';

  // Build flat list of all capability ids for progress count
  const allIds = useMemo(() => capabilities.map((c) => c.id), [capabilities]);

  const answeredCount = useMemo(
    () => allIds.filter((id) => features[id] !== undefined && features[id] !== null).length,
    [allIds, features],
  );

  const handleFeatureChange = useCallback(
    (featureId: string, value: FeatureValue) => {
      setValue(`features.${featureId}`, value, { shouldDirty: true, shouldValidate: true });
    },
    [setValue],
  );

  // Group capabilities by tier
  const tierEntries = useMemo(() => {
    const tiers = [1, 2, 3, 4, 5] as const;
    return tiers
      .map((tier) => {
        const tierCaps = capabilities.filter((c) => c.tier === tier);
        if (tierCaps.length === 0) return null;
        const config = TIER_CONFIG[tier];
        return {
          tier,
          tierName: config[lang],
          era: config.era,
          capabilities: tierCaps.map((c) => ({
            id: c.id,
            label: c[lang],
            examples: c.examples[lang],
          })),
        };
      })
      .filter(Boolean) as {
      tier: 1 | 2 | 3 | 4 | 5;
      tierName: string;
      era: string;
      capabilities: { id: string; label: string; examples: string }[];
    }[];
  }, [capabilities, lang]);

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
            style={{ width: `${allIds.length > 0 ? (answeredCount / allIds.length) * 100 : 0}%` }}
          />
        </div>
        <span className="shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
          {t('progress', { count: answeredCount, total: allIds.length })}
        </span>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        {([0, 1, 2, 3] as const).map((level) => {
          const scale = RESPONSE_SCALE[level];
          return (
            <span key={level} className="flex items-center gap-1.5">
              <span
                className="inline-block h-3 w-3 rounded-sm"
                style={{ backgroundColor: scale.color }}
              />
              {scale[lang]}
            </span>
          );
        })}
      </div>

      {/* Tiers */}
      <div className="flex flex-col gap-3">
        {tierEntries.map((entry) => (
          <TierSection
            key={entry.tier}
            tier={entry.tier}
            tierName={entry.tierName}
            era={entry.era}
            capabilities={entry.capabilities}
            features={features}
            onFeatureChange={handleFeatureChange}
            defaultExpanded={true}
          />
        ))}
      </div>
    </div>
  );
}
