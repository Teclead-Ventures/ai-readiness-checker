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
  Legend,
  LabelList,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SelfPerceptionComparisonProps {
  selfScoreBefore: number;    // 1-10
  confidenceBefore: number;   // 1-5
  overallScore: number;       // 0-100
  knowledgeManagementScore: number; // 0-100
}

function normalizeSelfScore(value: number) {
  // 1-10 → 0-100
  return Math.round(value * 10);
}

function normalizeConfidence(value: number) {
  // 1-5 → 0-100
  return Math.round(((value - 1) / 4) * 100);
}

function getDeltaVariant(delta: number): 'over' | 'under' | 'accurate' {
  if (delta > 10) return 'over';
  if (delta < -10) return 'under';
  return 'accurate';
}

export function SelfPerceptionComparison({
  selfScoreBefore,
  confidenceBefore,
  overallScore,
  knowledgeManagementScore,
}: SelfPerceptionComparisonProps) {
  const t = useTranslations('results');

  const selfReadiness = normalizeSelfScore(selfScoreBefore);
  const selfKnowledge = normalizeConfidence(confidenceBefore);

  const readinessDelta = selfReadiness - overallScore;
  const knowledgeDelta = selfKnowledge - knowledgeManagementScore;

  const data = [
    {
      name: t('selfPerceptionReadiness'),
      self: selfReadiness,
      actual: overallScore,
      delta: readinessDelta,
    },
    {
      name: t('selfPerceptionKnowledge'),
      self: selfKnowledge,
      actual: knowledgeManagementScore,
      delta: knowledgeDelta,
    },
  ];

  function getDeltaLabel(delta: number) {
    const variant = getDeltaVariant(delta);
    const abs = Math.abs(delta);
    if (variant === 'accurate') return t('selfPerceptionAccurate');
    if (variant === 'over') return t('selfPerceptionOverestimated', { n: abs });
    return t('selfPerceptionUnderestimated', { n: abs });
  }

  function getDeltaColor(delta: number) {
    const variant = getDeltaVariant(delta);
    if (variant === 'accurate') return 'text-green-600 bg-green-50';
    if (variant === 'over') return 'text-orange-600 bg-orange-50';
    return 'text-blue-600 bg-blue-50';
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>{t('selfPerception')}</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">{t('selfPerceptionDesc')}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} margin={{ top: 16, right: 24, left: 0, bottom: 4 }} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
              <Legend
                formatter={(value) =>
                  value === 'self' ? t('selfPerceptionSelf') : t('selfPerceptionActual')
                }
                wrapperStyle={{ fontSize: 12 }}
              />
              <Bar dataKey="self" name="self" fill="#444D69" radius={[4, 4, 0, 0]} maxBarSize={48}>
                <LabelList dataKey="self" position="top" style={{ fontSize: 11, fontWeight: 600 }} formatter={(v: unknown) => `${v}%`} />
              </Bar>
              <Bar dataKey="actual" name="actual" fill="#FFAB54" radius={[4, 4, 0, 0]} maxBarSize={48}>
                <LabelList dataKey="actual" position="top" style={{ fontSize: 11, fontWeight: 600 }} formatter={(v: unknown) => `${v}%`} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Delta badges */}
          <div className="grid grid-cols-2 gap-3">
            {data.map((entry) => (
              <div
                key={entry.name}
                className={`rounded-lg px-3 py-2 text-xs font-medium ${getDeltaColor(entry.delta)}`}
              >
                <span className="block text-[10px] opacity-70 mb-0.5">{entry.name}</span>
                {getDeltaLabel(entry.delta)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
