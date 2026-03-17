'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Code2, Briefcase } from 'lucide-react';
import type { Track } from '@/types/survey';

interface TrackSelectorProps {
  onSelect: (track: Track) => void;
  selected?: Track;
}

const tracks = [
  { value: 'dev' as const, icon: Code2 },
  { value: 'business' as const, icon: Briefcase },
];

export function TrackSelector({ onSelect, selected }: TrackSelectorProps) {
  const t = useTranslations('survey.trackSelection');

  return (
    <div className="space-y-6">
      <h2 className="text-xl sm:text-[1.875rem] font-bold font-display text-center hyphens-auto">{t('title')}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tracks.map(({ value, icon: Icon }) => (
          <motion.div
            key={value}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              className={`cursor-pointer transition-all min-h-[140px] rounded-xl border-2 ${
                selected === value
                  ? 'border-primary bg-primary/8 shadow-sm shadow-primary/20'
                  : 'border-border bg-card hover:border-primary/50 hover:bg-secondary/50'
              }`}
              onClick={() => onSelect(value)}
            >
              <CardHeader className="flex flex-col items-center text-center gap-3 py-6">
                <Icon className={`size-10 ${selected === value ? 'text-primary' : 'text-muted-foreground'}`} />
                <CardTitle className="text-lg text-foreground">
                  {value === 'dev' ? t('dev') : t('business')}
                </CardTitle>
                <CardDescription className="text-sm">
                  {value === 'dev' ? t('devDesc') : t('businessDesc')}
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
