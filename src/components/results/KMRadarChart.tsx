'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface KMRadarChartProps {
  knowledgeManagement: {
    awareness: number;         // 1-5
    filtering: number;         // 1-5
    contextualization: number; // 1-5
    overload: number;          // 1-5 (inverted: 5 = very overwhelmed = bad)
    knowledge_transfer: number;// 1-5
  };
}

function normalize(value: number, inverted = false): number {
  if (inverted) return Math.round(((5 - value) / 4) * 100);
  return Math.round(((value - 1) / 4) * 100);
}

export function KMRadarChart({ knowledgeManagement }: KMRadarChartProps) {
  const t = useTranslations('results');
  const { awareness, filtering, contextualization, overload, knowledge_transfer } = knowledgeManagement;

  const data = [
    { subject: t('kmAwareness'),         value: normalize(awareness),              raw: awareness },
    { subject: t('kmFiltering'),          value: normalize(filtering),              raw: filtering },
    { subject: t('kmContextualization'),  value: normalize(contextualization),      raw: contextualization },
    { subject: t('kmOverload'),           value: normalize(overload, true),         raw: overload, inverted: true },
    { subject: t('kmKnowledgeTransfer'),  value: normalize(knowledge_transfer),     raw: knowledge_transfer },
  ];

  const sorted = [...data].sort((a, b) => a.value - b.value);
  const weakest = sorted[0];
  const strongest = sorted[sorted.length - 1];

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
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={data} margin={{ top: 10, right: 40, bottom: 10, left: 40 }}>
              <PolarGrid stroke="currentColor" strokeOpacity={0.1} />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fontSize: 11, fill: 'currentColor' }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={false}
                axisLine={false}
              />
              <Radar
                dataKey="value"
                stroke="#FFAB54"
                fill="#FFAB54"
                fillOpacity={0.2}
                strokeWidth={2}
                dot={{ r: 4, fill: '#FFAB54', strokeWidth: 0 }}
              />
              <Tooltip
                formatter={(value) => [`${value}%`]}
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(0,0,0,0.8)',
                  color: '#fff',
                }}
              />
            </RadarChart>
          </ResponsiveContainer>

          <div className="mt-2 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs">
              <span className="block text-[10px] text-muted-foreground mb-0.5">{t('kmStrongest')}</span>
              <span className="font-semibold text-foreground">{strongest.subject}</span>
              <span className="ml-1.5 text-muted-foreground">{strongest.value}%</span>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs">
              <span className="block text-[10px] text-muted-foreground mb-0.5">{t('kmWeakest')}</span>
              <span className="font-semibold text-foreground">{weakest.subject}</span>
              <span className="ml-1.5 text-muted-foreground">{weakest.value}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
