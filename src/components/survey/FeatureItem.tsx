"use client";

import React, { useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { RESPONSE_SCALE } from "@/lib/features/types";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import type {
  FeatureEntry,
  FeatureValue,
  FeatureRelevance,
} from "@/types/survey";

interface FeatureItemProps {
  featureId: string;
  label: string;
  examples?: string;
  entry: FeatureEntry | undefined;
  onChange: (featureId: string, entry: FeatureEntry) => void;
}

const SCALE_ENTRIES = [
  {
    value: 0 as const,
    activeBg: "bg-red-500",
    activeRing: "ring-red-500/30",
    activeText: "text-white",
  },
  {
    value: 1 as const,
    activeBg: "bg-orange-500",
    activeRing: "ring-orange-500/30",
    activeText: "text-white",
  },
  {
    value: 2 as const,
    activeBg: "bg-yellow-500",
    activeRing: "ring-yellow-500/30",
    activeText: "text-black",
  },
  {
    value: 3 as const,
    activeBg: "bg-green-500",
    activeRing: "ring-green-500/30",
    activeText: "text-black",
  },
] as const;

const RELEVANCE_ENTRIES = [
  {
    value: "yes" as const,
    activeBg: "bg-blue-500",
    activeRing: "ring-blue-500/30",
    activeText: "text-white",
  },
  {
    value: "unsure" as const,
    activeBg: "bg-zinc-500",
    activeRing: "ring-zinc-500/30",
    activeText: "text-white",
  },
  {
    value: "no" as const,
    activeBg: "bg-slate-600",
    activeRing: "ring-slate-600/30",
    activeText: "text-white",
  },
] as const;

function FeatureItemInner({
  featureId,
  label,
  examples,
  entry,
  onChange,
}: FeatureItemProps) {
  const locale = useLocale();
  const t = useTranslations("survey.features");
  const lang = (locale === "de" ? "de" : "en") as "en" | "de";

  const isAnswered = entry?.score !== undefined && entry.score !== null;

  const handleScoreSelect = useCallback(
    (val: FeatureValue) => {
      onChange(featureId, { ...(entry ?? {}), score: val });
    },
    [featureId, entry, onChange]
  );

  const handleRelevanceSelect = useCallback(
    (val: FeatureRelevance) => {
      onChange(featureId, { ...(entry ?? {}), relevant: val });
    },
    [featureId, entry, onChange]
  );

  return (
    <div className="py-6 px-2 space-y-3">
      {/* Label */}
      <div>
        <p className="text-base font-medium leading-snug text-foreground">
          {label}
        </p>
        {examples && (
          <p className="mt-0.5 text-sm text-muted-foreground">{examples}</p>
        )}
      </div>

      {/* Usage row — vertical layout */}
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-muted-foreground">
          {t("usageLabel")}
        </span>
        <div className="flex w-full rounded-lg border border-border bg-background p-0.5 gap-0.5">
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
                  "flex-1 min-h-[2rem] cursor-pointer rounded-md px-2.5 py-1 text-sm font-medium transition-all select-none",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive
                    ? cn(
                        scaleEntry.activeBg,
                        scaleEntry.activeText,
                        "ring-2",
                        scaleEntry.activeRing,
                        "shadow-sm"
                      )
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                {scaleItem[lang]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Relevance row — vertical layout */}
      <div className="flex flex-col gap-1.5">
        <span className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
          {t("relevanceLabel")}
          <InfoTooltip content={t("relevanceTooltip")} side="top" />
        </span>
        <div className="flex w-full rounded-lg border border-border bg-background p-0.5 gap-0.5">
          {RELEVANCE_ENTRIES.map((relEntry) => {
            const isActive = entry?.relevant === relEntry.value;
            const labelKey =
              relEntry.value === "yes"
                ? "relevanceYes"
                : relEntry.value === "unsure"
                ? "relevanceUnsure"
                : "relevanceNo";
            return (
              <button
                key={relEntry.value}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => handleRelevanceSelect(relEntry.value)}
                className={cn(
                  "flex-1 min-h-[2rem] cursor-pointer rounded-md px-3 py-1 text-sm font-medium transition-all select-none",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive
                    ? cn(
                        relEntry.activeBg,
                        relEntry.activeText,
                        "ring-2",
                        relEntry.activeRing,
                        "shadow-sm"
                      )
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                {t(labelKey)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export const FeatureItem = React.memo(FeatureItemInner);
