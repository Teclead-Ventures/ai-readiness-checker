'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { TIER_CONFIG, RESPONSE_SCALE } from '@/lib/features/types';
import { getCapabilitiesForTrack } from '@/lib/scoring';
import { FeatureEntry } from '@/types/survey';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FeatureBreakdownProps {
  features: Record<string, FeatureEntry>;
  track: 'dev' | 'business';
  locale: string;
}

interface TierCount {
  tier: number;
  name: string;
  unaware: number;
  aware: number;
  tried: number;
  integrated: number;
  total: number;
}

export function FeatureBreakdown({ features, track, locale }: FeatureBreakdownProps) {
  const t = useTranslations('results');
  const lang = locale as 'en' | 'de';
  const capabilities = getCapabilitiesForTrack(track);

  const tierCounts: TierCount[] = ([1, 2, 3, 4, 5] as const).map((tier) => {
    const tierCaps = capabilities.filter((c) => c.tier === tier);
    let unaware = 0;
    let aware = 0;
    let tried = 0;
    let integrated = 0;

    for (const cap of tierCaps) {
      const rawEntry = features[cap.id];
      const val = (typeof rawEntry === 'object' ? rawEntry?.score : rawEntry) ?? 0;
      if (val === 0) unaware++;
      else if (val === 1) aware++;
      else if (val === 2) tried++;
      else integrated++;
    }

    return {
      tier,
      name: TIER_CONFIG[tier][lang],
      unaware,
      aware,
      tried,
      integrated,
      total: tierCaps.length,
    };
  }).filter((tc) => tc.total > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>{t('featureBreakdown')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-xs mb-2">
            {([0, 1, 2, 3] as const).map((level) => (
              <div key={level} className="flex items-center gap-1.5">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: RESPONSE_SCALE[level].color }}
                />
                <span>{RESPONSE_SCALE[level][lang]}</span>
              </div>
            ))}
          </div>

          {tierCounts.map((tc, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-medium truncate mr-2">
                  {t('tier')} {tc.tier}: {tc.name}
                </span>
                <span className="text-muted-foreground whitespace-nowrap">
                  {tc.integrated}/{tc.total} {RESPONSE_SCALE[3][lang].toLowerCase()}
                </span>
              </div>
              <div className="flex h-5 rounded-md overflow-hidden">
                {tc.unaware > 0 && (
                  <div
                    className="flex items-center justify-center text-[10px] text-white font-medium"
                    style={{
                      width: `${(tc.unaware / tc.total) * 100}%`,
                      backgroundColor: RESPONSE_SCALE[0].color,
                    }}
                  >
                    {tc.unaware}
                  </div>
                )}
                {tc.aware > 0 && (
                  <div
                    className="flex items-center justify-center text-[10px] text-white font-medium"
                    style={{
                      width: `${(tc.aware / tc.total) * 100}%`,
                      backgroundColor: RESPONSE_SCALE[1].color,
                    }}
                  >
                    {tc.aware}
                  </div>
                )}
                {tc.tried > 0 && (
                  <div
                    className="flex items-center justify-center text-[10px] text-white font-medium"
                    style={{
                      width: `${(tc.tried / tc.total) * 100}%`,
                      backgroundColor: RESPONSE_SCALE[2].color,
                    }}
                  >
                    {tc.tried}
                  </div>
                )}
                {tc.integrated > 0 && (
                  <div
                    className="flex items-center justify-center text-[10px] text-white font-medium"
                    style={{
                      width: `${(tc.integrated / tc.total) * 100}%`,
                      backgroundColor: RESPONSE_SCALE[3].color,
                    }}
                  >
                    {tc.integrated}
                  </div>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}
