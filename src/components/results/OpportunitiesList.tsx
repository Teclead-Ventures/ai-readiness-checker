'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Lightbulb } from 'lucide-react';
import { getCapabilitiesForTrack } from '@/lib/scoring';
import { TIER_CONFIG } from '@/lib/features/types';
import { FeatureEntry } from '@/types/survey';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface OpportunitiesListProps {
  features: Record<string, FeatureEntry>;
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
      value: (() => { const e = features[cap.id]; return (typeof e === 'object' ? e?.score : e) ?? 0; })(),
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
                className="bg-black/30 border border-white/10 rounded-xl p-4"
              >
                <p className="text-[14px] text-muted-foreground mb-1">{opp.tierName}</p>
                <h4 className="font-semibold text-[16px]">{opp.capabilityName}</h4>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
