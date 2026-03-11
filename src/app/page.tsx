'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Suspense, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useCampaignTracking } from '@/hooks/useCampaignTracking';
import { useFunnelTracking } from '@/hooks/useFunnelTracking';

function HomeContent() {
  const t = useTranslations();
  const [teamLink, setTeamLink] = useState('');
  const { src, cid } = useCampaignTracking();
  const { trackStep } = useFunnelTracking();

  useEffect(() => {
    trackStep('landing', 'enter');
  }, [trackStep]);

  const surveyHref = `/survey${src ? '?src=' + src + (cid ? '&cid=' + cid : '') : ''}`;

  return (
    <div className="flex flex-col items-center justify-center px-4 py-16 md:py-24">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#121212]">
          {t('landing.headline')}
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-lg mx-auto">
          {t('landing.subhead')}
        </p>

        <div className="pt-4">
          <Link href={surveyHref} onClick={() => trackStep('landing', 'complete')}>
            <Button size="lg" className="bg-[#FFAB54] hover:bg-[#FFAB54]/90 text-[#121212] font-bold text-lg px-8 py-6 rounded-xl">
              {t('landing.cta')}
            </Button>
          </Link>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 max-w-3xl mx-auto">
          {([
            { icon: '⏱', titleKey: 'feature1Title' as const, descKey: 'feature1Desc' as const },
            { icon: '📍', titleKey: 'feature2Title' as const, descKey: 'feature2Desc' as const },
            { icon: '📊', titleKey: 'feature3Title' as const, descKey: 'feature3Desc' as const },
          ]).map((feature, i) => (
            <motion.div
              key={feature.titleKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.15 }}
            >
              <Card className="border border-gray-100 shadow-sm h-full">
                <CardContent className="pt-5 text-center space-y-2">
                  <div className="text-2xl">{feature.icon}</div>
                  <h3 className="font-semibold text-[#121212] text-sm">
                    {t(`landing.${feature.titleKey}`)}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {t(`landing.${feature.descKey}`)}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card className="mt-8 max-w-md mx-auto border border-gray-200 shadow-none">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500 mb-3">{t('landing.teamLink')}</p>
            <div className="flex gap-2">
              <Input
                value={teamLink}
                onChange={(e) => setTeamLink(e.target.value)}
                placeholder={t('landing.teamLinkPlaceholder')}
                className="flex-1 border-gray-300 rounded-lg focus:ring-[#FFAB54] focus:border-[#FFAB54] px-4 py-3 text-[#121212]"
              />
              <Button
                onClick={() => {
                  if (teamLink) {
                    try {
                      const url = new URL(teamLink);
                      window.location.href = url.pathname;
                    } catch {
                      // Try as relative path
                      window.location.href = teamLink;
                    }
                  }
                }}
                className="bg-[#121212] text-white hover:bg-gray-800"
              >
                Go
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}
