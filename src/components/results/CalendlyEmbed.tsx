'use client';

import Script from 'next/script';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';

const CALENDLY_URL =
  'https://calendly.com/daniel-waesch-teclead-ventures/digitales-kennenlern';

export function CalendlyEmbed() {
  const t = useTranslations('results.bookingCta');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="border-[#FFAB54]/40 bg-linear-to-br from-[#FFAB54]/5 to-background overflow-hidden">
        <CardContent className="flex flex-col gap-6 pt-8 pb-0 px-0">
          <div className="text-center px-6">
            <h3 className="text-xl font-bold text-foreground">{t('title')}</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mt-2">
              {t('description')}
            </p>
          </div>
          <div
            className="calendly-inline-widget w-full"
            data-url={CALENDLY_URL}
            data-resize="true"
            style={{ minWidth: '320px', minHeight: '900px' }}
          />
        </CardContent>
      </Card>
      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="lazyOnload"
      />
    </motion.div>
  );
}
