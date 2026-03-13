'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const BOOKING_URL = process.env.NEXT_PUBLIC_BOOKING_URL;

export function BookingCTA() {
  if (!BOOKING_URL) return null;

  return (
    <BookingCTAInner />
  );
}

function BookingCTAInner() {
  const t = useTranslations('results.bookingCta');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="border-[#FFAB54]/40 bg-gradient-to-br from-[#FFAB54]/5 to-background">
        <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
          <h3 className="text-xl font-bold text-foreground">{t('title')}</h3>
          <p className="text-sm text-muted-foreground max-w-md">{t('description')}</p>
          <Button
            size="lg"
            className="bg-[#FFAB54] text-[#121212] font-bold hover:bg-[#FFAB54]/90 rounded-lg px-8 cursor-pointer"
            onClick={() => window.open(BOOKING_URL!, '_blank', 'noopener,noreferrer')}
          >
            {t('button')}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
