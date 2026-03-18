'use client';

import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFunnelTracking } from '@/hooks/useFunnelTracking';
import { hasConsent } from '@/hooks/useConsent';

export function TeamCTA() {
  const t = useTranslations('results.teamCta');
  const { trackStep } = useFunnelTracking(undefined, { enabled: hasConsent() });

  const handleCtaClick = useCallback(() => {
    trackStep('team_cta', 'enter');
  }, [trackStep]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
    >
      <div className="relative overflow-hidden rounded-xl bg-black border border-white/10">
        {/* Shimmer blobs */}
        <div className="absolute -top-60 -right-20 h-96 w-96 rounded-full bg-gray-500/50 blur-[100px]" />
        <div className="absolute -bottom-60 -left-40 h-96 w-96 rounded-full bg-[#F97316]/20 blur-[100px]" />

        <div className="relative z-10 flex flex-col items-center text-center py-8 px-4 gap-4">
          <Users className="h-10 w-10 text-[#FFAB54]" />
          <h3 className="text-xl font-semibold text-foreground">{t('title')}</h3>
          <p className="text-muted-foreground max-w-md">{t('description')}</p>
          <Button
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-bold"
            onClick={handleCtaClick}
            nativeButton={false}
            render={<a href="/team/new" />}
          >
            {t('button')}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
