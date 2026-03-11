'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { getFeaturesForTrack } from '@/lib/scoring';
import { FeatureValue } from '@/types/survey';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FeatureBreakdownProps {
  features: Record<string, FeatureValue>;
  track: 'dev' | 'business';
  locale: string;
}

interface CategoryCount {
  name: string;
  dontKnow: number;
  knowIt: number;
  useIt: number;
  total: number;
}

export function FeatureBreakdown({ features, track, locale }: FeatureBreakdownProps) {
  const t = useTranslations('results');
  const featureData = getFeaturesForTrack(track);

  const categoryCounts: CategoryCount[] = Object.entries(featureData).map(([key, category]) => {
    let dontKnow = 0;
    let knowIt = 0;
    let useIt = 0;

    for (const item of category.items) {
      const val = features[item.id] ?? 0;
      if (val === 0) dontKnow++;
      else if (val === 1) knowIt++;
      else useIt++;
    }

    return {
      name: category.name[locale as 'en' | 'de'] ?? category.name.en,
      dontKnow,
      knowIt,
      useIt,
      total: category.items.length,
    };
  });

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
          <div className="flex gap-4 text-xs mb-2">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-red-500" />
              <span>{t('dontKnow')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-amber-500" />
              <span>{t('knowIt')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-green-500" />
              <span>{t('useIt')}</span>
            </div>
          </div>

          {categoryCounts.map((cat, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-medium truncate mr-2">{cat.name}</span>
                <span className="text-muted-foreground whitespace-nowrap">
                  {cat.useIt}/{cat.total}
                </span>
              </div>
              <div className="flex h-5 rounded-md overflow-hidden">
                {cat.dontKnow > 0 && (
                  <div
                    className="bg-red-500 flex items-center justify-center text-[10px] text-white font-medium"
                    style={{ width: `${(cat.dontKnow / cat.total) * 100}%` }}
                  >
                    {cat.dontKnow}
                  </div>
                )}
                {cat.knowIt > 0 && (
                  <div
                    className="bg-amber-500 flex items-center justify-center text-[10px] text-white font-medium"
                    style={{ width: `${(cat.knowIt / cat.total) * 100}%` }}
                  >
                    {cat.knowIt}
                  </div>
                )}
                {cat.useIt > 0 && (
                  <div
                    className="bg-green-500 flex items-center justify-center text-[10px] text-white font-medium"
                    style={{ width: `${(cat.useIt / cat.total) * 100}%` }}
                  >
                    {cat.useIt}
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
