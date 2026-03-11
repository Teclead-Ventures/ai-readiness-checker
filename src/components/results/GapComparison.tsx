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
  Cell,
  LabelList,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GapComparisonProps {
  selfScoreBefore: number;
  selfScoreAfter: number;
  utilizationAfter: number;
  potentialUtilization: number;
  locale: string;
}

export function GapComparison({
  selfScoreBefore,
  selfScoreAfter,
  utilizationAfter,
  potentialUtilization,
  locale,
}: GapComparisonProps) {
  const t = useTranslations('results');

  const selfAwarenessData = [
    {
      name: t('selfAwarenessBefore'),
      value: selfScoreBefore,
      color: '#3b82f6',
    },
    {
      name: t('selfAwarenessAfter'),
      value: selfScoreAfter,
      color: '#22c55e',
    },
  ];

  const utilizationData = [
    {
      name: t('utilizationCurrent'),
      value: utilizationAfter,
      color: '#3b82f6',
    },
    {
      name: t('utilizationPotential'),
      value: potentialUtilization,
      color: '#22c55e',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      <Card>
        <CardHeader>
          <CardTitle>{t('selfAwareness')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={selfAwarenessData} layout="vertical" margin={{ left: 20, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 10]} />
              <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={28}>
                {selfAwarenessData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
                <LabelList dataKey="value" position="right" style={{ fontSize: 13, fontWeight: 600 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('utilization')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={utilizationData} layout="vertical" margin={{ left: 20, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} unit="%" />
              <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={28}>
                {utilizationData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
                <LabelList
                  dataKey="value"
                  position="right"
                  formatter={(v) => `${v}%`}
                  style={{ fontSize: 13, fontWeight: 600 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}
