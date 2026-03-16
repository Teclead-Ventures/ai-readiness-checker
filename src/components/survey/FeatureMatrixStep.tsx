'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslations, useLocale } from 'next-intl';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DEV_CAPABILITIES } from '@/lib/features/dev-features';
import { BUSINESS_CAPABILITIES } from '@/lib/features/business-features';
import { TIER_CONFIG, RESPONSE_SCALE, Capability } from '@/lib/features/types';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { FeatureItem } from './FeatureItem';
import type { FeatureEntry, SurveyFormData, Track } from '@/types/survey';

interface FeatureMatrixStepProps {
  track: Track;
}

interface TierSectionProps {
  tier: 1 | 2 | 3 | 4 | 5;
  tierName: string;
  tierTooltip: string;
  era: string;
  capabilities: { id: string; label: string; examples: string }[];
  features: Record<string, FeatureEntry>;
  onFeatureChange: (featureId: string, entry: FeatureEntry) => void;
  defaultExpanded: boolean;
}

/** Visual identity per tier: badge color, progress bar color, left border accent (dark mode) */
const TIER_STYLES = {
  1: {
    badge:    'bg-blue-500/15 text-blue-300 border border-blue-500/30',
    bar:      'bg-blue-500',
    border:   'border-l-4 border-l-blue-500/60',
  },
  2: {
    badge:    'bg-teal-500/15 text-teal-300 border border-teal-500/30',
    bar:      'bg-teal-500',
    border:   'border-l-4 border-l-teal-500/60',
  },
  3: {
    badge:    'bg-green-500/15 text-green-300 border border-green-500/30',
    bar:      'bg-green-500',
    border:   'border-l-4 border-l-green-500/60',
  },
  4: {
    badge:    'bg-primary/15 text-primary border border-primary/30',
    bar:      'bg-primary',
    border:   'border-l-4 border-l-primary/60',
  },
  5: {
    badge:    'bg-purple-500/15 text-purple-300 border border-purple-500/30',
    bar:      'bg-purple-500',
    border:   'border-l-4 border-l-purple-500/60',
  },
} as const;

function computeTierScore(
  capabilities: { id: string }[],
  features: Record<string, FeatureEntry>,
): { answered: number; total: number; score: number } {
  let answered = 0;
  let sum = 0;
  const total = capabilities.length;

  for (const cap of capabilities) {
    const entry = features[cap.id];
    const score = typeof entry === 'object' ? entry?.score : (entry as number | undefined);
    if (score !== undefined && score !== null) {
      answered++;
      sum += score;
    }
  }

  const score = total > 0 ? Math.round((sum / (total * 3)) * 100) : 0;
  return { answered, total, score };
}

function TierSection({
  tier,
  tierName,
  tierTooltip,
  era,
  capabilities,
  features,
  onFeatureChange,
  defaultExpanded,
}: TierSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const t = useTranslations('survey.features');

  const { answered, total, score } = useMemo(
    () => computeTierScore(capabilities, features),
    [capabilities, features],
  );

  const styles = TIER_STYLES[tier];

  return (
    <div className={cn('overflow-hidden rounded-lg border border-border bg-card', styles.border)}>
      {/* Header — InfoTooltip lives outside the <button> to avoid nested buttons */}
      <div className="flex w-full items-center hover:bg-muted/40 transition-colors">
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="flex flex-1 cursor-pointer items-center gap-3 px-4 py-3 text-left min-w-0"
          aria-expanded={expanded}
        >
          <ChevronDown
            className={cn(
              'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200',
              expanded && 'rotate-180',
            )}
          />

          {/* Tier badge */}
          <span className={cn('shrink-0 rounded-md px-2 py-0.5 text-xs font-bold tabular-nums', styles.badge)}>
            T{tier}
          </span>

          {/* Title + meta */}
          <div className="flex flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2 min-w-0">
            <span className="text-sm font-semibold text-foreground truncate">
              {tierName}
            </span>
            <span className="text-xs text-muted-foreground shrink-0">
              {era ? `${era} · ` : ''}{answered}/{total} {t('answered')}
            </span>
          </div>

          {/* Score */}
          <span className="shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
            {score}%
          </span>
        </button>

        {/* Tooltip sits outside the button — no nested button issue */}
        <div className="shrink-0 px-3">
          <InfoTooltip content={tierTooltip} side="top" />
        </div>
      </div>

      {/* Progress bar in tier color */}
      <div className="h-1 w-full bg-muted">
        <div
          className={cn('h-full transition-all duration-500', styles.bar)}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Capabilities list */}
      {expanded && (
        <div className="flex flex-col gap-2 px-3 pb-3 pt-1">
          {capabilities.map((cap) => (
            <FeatureItem
              key={cap.id}
              featureId={cap.id}
              label={cap.label}
              examples={cap.examples}
              entry={features[cap.id]}
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
  const features: Record<string, FeatureEntry> =
    useWatch<SurveyFormData, 'features'>({ name: 'features' }) ?? {};

  const lang = (locale === 'de' ? 'de' : 'en') as 'en' | 'de';

  const allIds = useMemo(() => capabilities.map((c) => c.id), [capabilities]);

  const answeredCount = useMemo(
    () =>
      allIds.filter((id) => {
        const entry = features[id];
        const score = typeof entry === 'object' ? entry?.score : (entry as number | undefined);
        return score !== undefined && score !== null;
      }).length,
    [allIds, features],
  );

  const handleFeatureChange = useCallback(
    (featureId: string, entry: FeatureEntry) => {
      setValue(`features.${featureId}`, entry, { shouldDirty: true, shouldValidate: true });
    },
    [setValue],
  );

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
          tierTooltip: t(`tierTooltip${tier}`),
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
        tierTooltip: string;
        era: string;
        capabilities: { id: string; label: string; examples: string }[];
      }[];
  }, [capabilities, lang, t]);

  const progressPct = allIds.length > 0 ? (answeredCount / allIds.length) * 100 : 0;
  const minRequired = Math.ceil(allIds.length * 0.5);
  const hasEnough = answeredCount >= minRequired;

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">{t('title')}</h2>
        <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{t('progress', { count: answeredCount, total: allIds.length })}</span>
          {!hasEnough && (
            <span className="text-amber-600 font-medium">
              {t('minRequired', { min: minRequired })}
            </span>
          )}
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-300',
              hasEnough ? 'bg-green-500' : 'bg-primary',
            )}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Usage scale legend */}
      <div className="flex flex-wrap gap-3 rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
        {([0, 1, 2, 3] as const).map((level) => {
          const scale = RESPONSE_SCALE[level];
          return (
            <span key={level} className="flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5 rounded-sm shrink-0"
                style={{ backgroundColor: scale.color }}
              />
              <span>{scale[lang]}</span>
              <InfoTooltip content={scale.description[lang]} side="top" />
            </span>
          );
        })}
      </div>

      {/* Tier sections */}
      <div className="flex flex-col gap-3">
        {tierEntries.map((entry) => (
          <TierSection
            key={entry.tier}
            tier={entry.tier}
            tierName={entry.tierName}
            tierTooltip={entry.tierTooltip}
            era={entry.era}
            capabilities={entry.capabilities}
            features={features}
            onFeatureChange={handleFeatureChange}
            defaultExpanded={entry.tier <= 2}
          />
        ))}
      </div>
    </div>
  );
}
