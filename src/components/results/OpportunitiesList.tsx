'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Lightbulb } from 'lucide-react';
import { getFeaturesForTrack } from '@/lib/scoring';
import { FeatureValue } from '@/types/survey';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface OpportunitiesListProps {
  features: Record<string, FeatureValue>;
  track: 'dev' | 'business';
  locale: string;
}

interface Opportunity {
  categoryName: string;
  knowButDontUseCount: number;
  items: string[];
}

export function OpportunitiesList({ features, track, locale }: OpportunitiesListProps) {
  const t = useTranslations('results');
  const featureData = getFeaturesForTrack(track);
  const lang = locale as 'en' | 'de';

  const opportunities: Opportunity[] = Object.entries(featureData)
    .map(([key, category]) => {
      const knowButDontUse = category.items.filter((item) => features[item.id] === 1);
      return {
        categoryName: category.name[lang] ?? category.name.en,
        knowButDontUseCount: knowButDontUse.length,
        items: knowButDontUse.map((item) => item[lang] ?? item.en),
      };
    })
    .filter((o) => o.knowButDontUseCount > 0)
    .sort((a, b) => b.knowButDontUseCount - a.knowButDontUseCount)
    .slice(0, 3);

  if (opportunities.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-[#FFAB54]" />
            {t('opportunities')}
          </CardTitle>
          <CardDescription>{t('opportunitiesDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {opportunities.map((opp, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.6 + i * 0.1 }}
                className="bg-[#FFAB54]/5 border border-[#FFAB54]/20 rounded-xl p-4"
              >
                <h4 className="font-semibold text-sm mb-1">{opp.categoryName}</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  {opp.knowButDontUseCount} {t('knowIt').toLowerCase()} &rarr; {t('useIt').toLowerCase()}
                </p>
                <ul className="space-y-1">
                  {opp.items.map((item, j) => (
                    <li key={j} className="text-xs text-gray-700 flex items-start gap-1.5">
                      <span className="text-[#FFAB54] mt-0.5">&#x2022;</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
