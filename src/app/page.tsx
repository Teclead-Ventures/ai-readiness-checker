'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Suspense, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useCampaignTracking } from '@/hooks/useCampaignTracking';
import { useFunnelTracking } from '@/hooks/useFunnelTracking';
import { ArrowRight, Clock, MapPin, BarChart3 } from 'lucide-react';

const FEATURE_ICONS = [Clock, MapPin, BarChart3];

function HomeContent() {
  const t = useTranslations();
  const [teamLink, setTeamLink] = useState('');
  const { src, cid } = useCampaignTracking();
  const { trackStep } = useFunnelTracking();

  useEffect(() => {
    trackStep('landing', 'enter');
  }, [trackStep]);

  const surveyHref = `/survey${src ? '?src=' + src + (cid ? '&cid=' + cid : '') : ''}`;

  const features = [
    { Icon: FEATURE_ICONS[0], titleKey: 'feature1Title' as const, descKey: 'feature1Desc' as const },
    { Icon: FEATURE_ICONS[1], titleKey: 'feature2Title' as const, descKey: 'feature2Desc' as const },
    { Icon: FEATURE_ICONS[2], titleKey: 'feature3Title' as const, descKey: 'feature3Desc' as const },
  ];

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-130px)]">
      {/* Dot grid background */}
      <div className="absolute inset-0 dot-grid pointer-events-none" />

      {/* Radial glow center */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 30%, oklch(0.76 0.16 62 / 0.07) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center px-4 py-16 md:py-24 w-full max-w-4xl mx-auto">

        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-semibold tracking-widest text-primary uppercase">
            Teclead Ventures · AI Assessment
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-none mb-4"
          style={{ fontFamily: 'var(--font-barlow-condensed)' }}
        >
          {t('landing.headline')}
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base md:text-lg text-muted-foreground max-w-xl text-center mb-10"
        >
          {t('landing.subhead')}
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Link href={surveyHref} onClick={() => trackStep('landing', 'complete')}>
            <Button
              size="lg"
              className="glow-orange bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base px-8 py-6 rounded-xl tracking-wide transition-all hover:scale-[1.02] active:scale-[0.99]"
            >
              {t('landing.cta')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 w-full max-w-3xl">
          {features.map(({ Icon, titleKey, descKey }, i) => (
            <motion.div
              key={titleKey}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.12 }}
              className="group rounded-xl border border-border bg-card p-5 flex flex-col gap-3 hover:border-primary/40 hover:bg-card/80 transition-all duration-200 hover:glow-orange-sm"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 group-hover:border-primary/40 transition-colors">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm mb-1">
                  {t(`landing.${titleKey}`)}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t(`landing.${descKey}`)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Team link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-10 w-full max-w-sm"
        >
          <p className="text-xs text-muted-foreground text-center mb-3">
            {t('landing.teamLink')}
          </p>
          <div className="flex gap-2">
            <Input
              value={teamLink}
              onChange={(e) => setTeamLink(e.target.value)}
              placeholder={t('landing.teamLinkPlaceholder')}
              className="flex-1 bg-card border-border rounded-lg text-sm placeholder:text-muted-foreground/50 focus-visible:ring-primary focus-visible:border-primary"
            />
            <Button
              onClick={() => {
                if (teamLink) {
                  try {
                    const url = new URL(teamLink);
                    window.location.href = url.pathname;
                  } catch {
                    window.location.href = teamLink;
                  }
                }
              }}
              variant="outline"
              className="border-border bg-secondary text-foreground hover:border-primary/50 hover:text-primary transition-colors"
            >
              Go
            </Button>
          </div>
        </motion.div>
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
