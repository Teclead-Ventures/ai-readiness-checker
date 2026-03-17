'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LabelList,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SelfPerceptionComparisonProps {
  selfScoreBefore: number;          // 1-10
  selfScoreAfter: number;           // 1-10
  overallScore: number;             // 0-100
  confidenceBefore: number;         // 1-5
  confidenceAfter: number;          // 1-5
  knowledgeManagementScore: number; // 0-100 — unused intentionally
  utilizationBefore: number;        // 0-100
  utilizationAfter: number;         // 0-100
  potentialUtilization: number;     // 0-100
}

function normalizeSelfScore(value: number) {
  return Math.round(value * 10);
}

function normalizeConfidence(value: number) {
  return Math.round(((value - 1) / 4) * 100);
}

const LABEL_STYLE = { fontSize: 10, fontWeight: 600 } as const;
const BAR_PROPS = { radius: [4, 4, 0, 0] as [number, number, number, number], maxBarSize: 48 };

function MiniBarChart({ data }: { data: { name: string; value: number; fill: string }[] }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 20, right: 8, left: 0, bottom: 4 }} barCategoryGap="25%">
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} unit="%" width={32} />
        <Bar dataKey="value" {...BAR_PROPS}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.fill} />
          ))}
          <LabelList
            dataKey="value"
            position="top"
            style={LABEL_STYLE}
            formatter={(v: unknown) => `${v}%`}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SelfPerceptionComparison({
  selfScoreBefore,
  selfScoreAfter,
  overallScore,
  confidenceBefore,
  confidenceAfter,
  utilizationBefore,
  utilizationAfter,
  potentialUtilization,
}: SelfPerceptionComparisonProps) {
  const t = useTranslations('results');

  const groups = [
    {
      title: t('comparisonReadiness'),
      subtitle: t('comparisonReadinessDesc'),
      bars: [
        { name: t('comparisonShortBefore'), value: normalizeSelfScore(selfScoreBefore), fill: '#444D69' },
        { name: t('comparisonShortAfter'), value: normalizeSelfScore(selfScoreAfter), fill: '#94A3B8' },
        { name: t('comparisonShortMeasured'), value: overallScore, fill: '#FFAB54' },
      ],
    },
    {
      title: t('comparisonKnowledge'),
      subtitle: t('comparisonKnowledgeDesc'),
      bars: [
        { name: t('comparisonShortBefore'), value: normalizeConfidence(confidenceBefore), fill: '#444D69' },
        { name: t('comparisonShortAfter'), value: normalizeConfidence(confidenceAfter), fill: '#94A3B8' },
      ],
    },
    {
      title: t('comparisonUtilization'),
      subtitle: t('comparisonUtilizationDesc'),
      bars: [
        { name: t('comparisonShortBefore'), value: utilizationBefore, fill: '#444D69' },
        { name: t('comparisonShortAfter'), value: utilizationAfter, fill: '#94A3B8' },
        { name: t('comparisonShortPossible'), value: potentialUtilization, fill: '#34D399' },
      ],
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>{t('comparisonTitle')}</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">{t('comparisonDesc')}</p>
        </CardHeader>
        <CardContent className="space-y-2">
          {/* 3 mini charts */}
          <div className="grid grid-cols-3 gap-2">
            {groups.map((group) => (
              <div key={group.title}>
                <p className="text-xs font-semibold text-center">{group.title}</p>
                <p className="text-[10px] text-center text-muted-foreground mb-1 leading-tight px-1">{group.subtitle}</p>
                <MiniBarChart data={group.bars} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
