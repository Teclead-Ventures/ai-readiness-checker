'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function TeamCTA() {
  const t = useTranslations('results.teamCta');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
    >
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="flex flex-col items-center text-center py-8 gap-4">
          <Users className="h-10 w-10 text-blue-500" />
          <h3 className="text-xl font-semibold">{t('title')}</h3>
          <p className="text-muted-foreground max-w-md">{t('description')}</p>
          <Button
            size="lg"
            render={<a href="/team/new" />}
          >
            {t('button')}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
