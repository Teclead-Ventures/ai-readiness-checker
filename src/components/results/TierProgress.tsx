'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ChevronDown } from 'lucide-react';
import { TIER_CONFIG, RESPONSE_SCALE } from '@/lib/features/types';
import { getCapabilitiesForTrack } from '@/lib/scoring';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TierProgressProps {
  tiers: Record<number, number>;
  features: Record<string, number>;
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
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs font-semibold text-muted-foreground w-12">
                    {t('tier')} {tier}
                  </span>
                  <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: getBarColor(score) }}
                      initial={{ width: 0 }}
                      animate={{ width: `${score}%` }}
                      transition={{ duration: 0.8, delay: 0.1 * tier }}
                    />
                  </div>
                  <span className="text-sm font-bold w-10 text-right">{score}%</span>
                  <span className="text-xs text-muted-foreground truncate w-36 hidden sm:block">
                    {TIER_CONFIG[tier][lang]}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform ${
                      expandedTier === tier ? 'rotate-180' : ''
                    }`}
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
                    <div className="ml-12 pl-3 border-l-2 border-gray-200 space-y-1.5 py-2">
                      {caps.map((cap) => {
                        const value = (features[cap.id] ?? 0) as 0 | 1 | 2 | 3;
                        const scale = RESPONSE_SCALE[value];
                        return (
                          <div key={cap.id} className="flex items-center justify-between text-xs">
                            <span className="truncate mr-2">{cap[lang]}</span>
                            <span
                              className="shrink-0 px-2 py-0.5 rounded-full text-white font-medium text-[10px]"
                              style={{ backgroundColor: scale.color }}
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
