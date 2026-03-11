'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';
import { getFeaturesForTrack } from '@/lib/scoring';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RadarChartProps {
  categories: Record<string, number>;
  track: 'dev' | 'business';
  locale: string;
}

export function RadarChart({ categories, track, locale }: RadarChartProps) {
  const t = useTranslations('results');
  const featureData = getFeaturesForTrack(track);

  const data = Object.entries(categories).map(([key, value]) => ({
    category: featureData[key]?.name[locale as 'en' | 'de'] ?? featureData[key]?.name.en ?? key,
    score: value,
    fullMark: 100,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>{t('radar')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <RechartsRadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
              <PolarGrid />
              <PolarAngleAxis
                dataKey="category"
                tick={{ fontSize: 11 }}
              />
              <Radar
                name="Score"
                dataKey="score"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.3}
              />
            </RechartsRadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}
