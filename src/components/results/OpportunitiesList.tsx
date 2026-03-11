'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Lightbulb } from 'lucide-react';
import { getCapabilitiesForTrack } from '@/lib/scoring';
import { TIER_CONFIG } from '@/lib/features/types';
import { FeatureValue } from '@/types/survey';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface OpportunitiesListProps {
  features: Record<string, FeatureValue>;
  track: 'dev' | 'business';
  locale: string;
}

interface Opportunity {
  tierName: string;
  tier: number;
  capabilityName: string;
  firstAvailable: string;
  value: number;
}

export function OpportunitiesList({ features, track, locale }: OpportunitiesListProps) {
  const t = useTranslations('results');
  const lang = locale as 'en' | 'de';
  const capabilities = getCapabilitiesForTrack(track);

  // Find top opportunities: capabilities where user scored lowest, prioritized by tier weight
  const opportunities: Opportunity[] = capabilities
    .map((cap) => ({
      tierName: TIER_CONFIG[cap.tier][lang],
      tier: cap.tier,
      capabilityName: cap[lang],
      firstAvailable: cap.firstAvailable,
      value: features[cap.id] ?? 0,
    }))
    .filter((o) => o.value < 3) // Not yet integrated
    .sort((a, b) => {
      // Sort by value ascending (worst first), then by tier ascending (foundational first)
      if (a.value !== b.value) return a.value - b.value;
      return a.tier - b.tier;
    })
    .slice(0, 6);

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {opportunities.map((opp, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.6 + i * 0.1 }}
                className="bg-[#FFAB54]/5 border border-[#FFAB54]/20 rounded-xl p-4"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    {t('tier')} {opp.tier}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{opp.tierName}</span>
                </div>
                <h4 className="font-semibold text-sm mb-1">{opp.capabilityName}</h4>
                <p className="text-xs text-muted-foreground">
                  {t('availableSince')} {opp.firstAvailable}
                </p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
