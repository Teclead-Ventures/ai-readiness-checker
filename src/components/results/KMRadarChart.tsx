'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface KMRadarChartProps {
  knowledgeManagement: {
    awareness: number;          // 1-5
    filtering: number;          // 1-5
    contextualization: number;  // 1-5
    overload: number;           // 1-5 (optimal is 3)
    knowledge_transfer: number; // 1-5
  };
}

function normalize(value: number): number {
  return Math.round(((value - 1) / 4) * 100);
}

function normalizeBalance(value: number): number {
  return Math.round((1 - Math.abs(value - 3) / 2) * 100);
}

type Level = 'strong' | 'neutral' | 'weak';

function getLevel(score: number): Level {
  if (score >= 60) return 'strong';
  if (score <= 40) return 'weak';
  return 'neutral';
}

const icons: Record<Level, { symbol: string; className: string }> = {
  strong:  { symbol: '+', className: 'text-green-500 font-bold' },
  neutral: { symbol: '·', className: 'text-muted-foreground text-lg leading-none' },
  weak:    { symbol: '−', className: 'text-red-500 font-bold' },
};

export function KMRadarChart({ knowledgeManagement }: KMRadarChartProps) {
  const t = useTranslations('results');
  const { awareness, filtering, contextualization, overload, knowledge_transfer } = knowledgeManagement;

  const levelOrder: Record<Level, number> = { strong: 0, neutral: 1, weak: 2 };

  const items = [
    { key: 'awareness',         level: getLevel(normalize(awareness)) },
    { key: 'filtering',         level: getLevel(normalize(filtering)) },
    { key: 'contextualization', level: getLevel(normalize(contextualization)) },
    { key: 'overload',          level: getLevel(normalize(6 - overload)) },
    { key: 'knowledgeTransfer', level: getLevel(normalize(knowledge_transfer)) },
  ].sort((a, b) => levelOrder[a.level] - levelOrder[b.level]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>{t('kmRadar')}</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">{t('kmRadarDesc')}</p>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2.5">
            {items.map(({ key, level }) => {
              const { symbol, className } = icons[level];
              return (
                <li key={key} className="flex items-start gap-2.5 text-sm">
                  <span className={`mt-0.5 w-4 shrink-0 text-center ${className}`}>{symbol}</span>
                  <span className="text-foreground">{t(`km_${key}_${level}` as Parameters<typeof t>[0])}</span>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
}
