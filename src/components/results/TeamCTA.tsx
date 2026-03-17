'use client';

import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useFunnelTracking } from '@/hooks/useFunnelTracking';

export function TeamCTA() {
  const t = useTranslations('results.teamCta');
  const { trackStep } = useFunnelTracking();

  const handleCtaClick = useCallback(() => {
    trackStep('team_cta', 'enter');
  }, [trackStep]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
    >
      <Card className="bg-gradient-to-br from-[#FFAB54]/10 to-[#FFAB54]/5 border border-[#FFAB54]/20">
        <CardContent className="flex flex-col items-center text-center py-8 gap-4">
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
        </CardContent>
      </Card>
    </motion.div>
  );
}
