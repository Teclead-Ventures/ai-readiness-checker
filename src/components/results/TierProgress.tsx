'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { TIER_CONFIG, RESPONSE_SCALE } from '@/lib/features/types';
import { getCapabilitiesForTrack } from '@/lib/scoring';
import { FeatureEntry } from '@/types/survey';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TierProgressProps {
  tiers: Record<number, number>;
  features: Record<string, FeatureEntry>;
  track: 'dev' | 'business';
  locale: string;
}

export function TierProgress({ tiers, features, track, locale }: TierProgressProps) {
  const t = useTranslations('results');
  const lang = locale as 'en' | 'de';
  const [expandedTier, setExpandedTier] = useState<number | null>(null);
  const capabilities = getCapabilitiesForTrack(track);

  const tierEntries = ([1, 2, 3, 4, 5] as const).map((tier) => {
    const tierCaps = capabilities.filter((c) => c.tier === tier);
    const counts = { 0: 0, 1: 0, 2: 0, 3: 0 } as Record<0 | 1 | 2 | 3, number>;
    for (const cap of tierCaps) {
      const entry = features[cap.id];
      const value = ((typeof entry === 'object' ? entry?.score : entry) ?? 0) as 0 | 1 | 2 | 3;
      counts[value]++;
    }
    return { tier, score: tiers[tier] ?? 0, caps: tierCaps, counts, total: tierCaps.length };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('tierProgress')}</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="text-muted-foreground hover:text-foreground transition-colors">
                <HelpCircle className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-72">
                {t('tierProgressTooltip')}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardHeader>
        <CardContent className="space-y-3">
          {tierEntries.map(({ tier, score, caps, counts, total }) => (
            <div key={tier}>
              {/* Progress bar row */}
              <div
                className="w-full text-left group cursor-pointer"
                onClick={() => setExpandedTier(expandedTier === tier ? null : tier)}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs text-muted-foreground truncate">
                    {TIER_CONFIG[tier][lang]}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold">{score}%</span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${
                        expandedTier === tier ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>
                <div className="h-4 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full flex"
                    style={{ transformOrigin: 'left' }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 0.1 * tier }}
                  >
                    {([3, 2, 1, 0] as const).map((level) => {
                      const pct = total > 0 ? (counts[level] / total) * 100 : 0;
                      if (pct === 0) return null;
                      return (
                        <div
                          key={level}
                          className="h-full"
                          style={{ backgroundColor: RESPONSE_SCALE[level].color, width: `${pct}%` }}
                        />
                      );
                    })}
                  </motion.div>
                </div>
              </div>

              {/* Expanded capability detail */}
              <AnimatePresence>
                {expandedTier === tier && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="pl-3 border-l-2 border-border space-y-1.5 py-2">
                      {[...caps].sort((a, b) => {
                        const va = ((typeof features[a.id] === 'object' ? (features[a.id] as { score?: number })?.score : features[a.id]) ?? 0) as number;
                        const vb = ((typeof features[b.id] === 'object' ? (features[b.id] as { score?: number })?.score : features[b.id]) ?? 0) as number;
                        return vb - va;
                      }).map((cap) => {
                        const entry = features[cap.id];
                        const value = ((typeof entry === 'object' ? entry?.score : entry) ?? 0) as 0 | 1 | 2 | 3;
                        const scale = RESPONSE_SCALE[value];
                        return (
                          <div key={cap.id} className="flex items-center justify-between text-xs">
                            <span className="truncate mr-2">{cap[lang]}</span>
                            <span
                              className="shrink-0 px-2 py-0.5 rounded-full font-medium text-[10px]"
                              style={{
                                backgroundColor: scale.color,
                                color: value >= 2 ? '#000' : '#fff',
                              }}
                            >
                              {scale[lang]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}
