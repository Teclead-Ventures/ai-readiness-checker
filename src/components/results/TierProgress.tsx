'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ChevronDown } from 'lucide-react';
import { TIER_CONFIG, RESPONSE_SCALE } from '@/lib/features/types';
import { getCapabilitiesForTrack } from '@/lib/scoring';
import { FeatureEntry } from '@/types/survey';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TierProgressProps {
  tiers: Record<number, number>;
  features: Record<string, FeatureEntry>;
  track: 'dev' | 'business';
  locale: string;
}

function getBarColor(score: number): string {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#84cc16';
  if (score >= 40) return '#eab308';
  if (score >= 20) return '#f97316';
  return '#ef4444';
}

export function TierProgress({ tiers, features, track, locale }: TierProgressProps) {
  const t = useTranslations('results');
  const lang = locale as 'en' | 'de';
  const [expandedTier, setExpandedTier] = useState<number | null>(null);
  const capabilities = getCapabilitiesForTrack(track);

  const tierEntries = ([1, 2, 3, 4, 5] as const).map((tier) => {
    const tierCaps = capabilities.filter((c) => c.tier === tier);
    return { tier, score: tiers[tier] ?? 0, caps: tierCaps };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>{t('tierProgress')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {tierEntries.map(({ tier, score, caps }) => (
            <div key={tier}>
              {/* Progress bar row */}
              <button
                className="w-full text-left group"
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
                    className="h-full rounded-full"
                    style={{ backgroundColor: getBarColor(score) }}
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 0.8, delay: 0.1 * tier }}
                  />
                </div>
              </button>

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
                      {caps.map((cap) => {
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
