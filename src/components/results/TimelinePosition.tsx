'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  ComposedChart,
  XAxis,
  YAxis,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Label,
} from 'recharts';
import { TIER_CONFIG } from '@/lib/features/types';
import type { ScoreResult } from '@/lib/scoring';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TimelinePositionProps {
  timeline: ScoreResult['timeline'];
  adaptation?: ScoreResult['adaptation'];
  locale: string;
}

// Era bands mapped to month values (months since year 0)
export const ERA_BANDS = [
  { tier: 1 as const, startMonth: 2022 * 12 + 1, endMonth: 2023 * 12 + 6, color: '#22c55e20' },
  { tier: 2 as const, startMonth: 2023 * 12 + 6, endMonth: 2024 * 12 + 6, color: '#3b82f620' },
  { tier: 3 as const, startMonth: 2024 * 12 + 6, endMonth: 2025 * 12 + 1, color: '#eab30820' },
  { tier: 4 as const, startMonth: 2025 * 12 + 1, endMonth: 2025 * 12 + 12, color: '#f9731620' },
  { tier: 5 as const, startMonth: 2025 * 12 + 12, endMonth: 2027 * 12 + 1, color: '#a855f720' },
];

export function dateToMonth(dateStr: string): number {
  const [y, m] = dateStr.split('-').map(Number);
  return y * 12 + m;
}

function subtractMonths(dateStr: string, months: number): string {
  const [y, m] = dateStr.split('-').map(Number);
  const totalMonths = y * 12 + m - months;
  const newYear = Math.floor(totalMonths / 12);
  const newMonth = totalMonths % 12 || 12;
  return `${newYear}-${String(newMonth).padStart(2, '0')}`;
}

const DIRECTION_COLORS: Record<string, string> = {
  closing: '#22c55e',
  stable: '#eab308',
  widening: '#ef4444',
};

const MIN_MONTH = 2022 * 12 + 1;
const MAX_MONTH = 2027 * 12 + 1;

// Compute label positions to avoid overlaps
function computeLabelPositions(
  markers: { key: string; month: number }[],
  minMonth: number,
  maxMonth: number,
): Record<string, 'top' | 'insideTopLeft' | 'insideTopRight' | 'insideTop'> {
  const range = maxMonth - minMonth;
  const positions: Record<string, 'top' | 'insideTopLeft' | 'insideTopRight' | 'insideTop'> = {};

  // Sort markers by month
  const sorted = [...markers].sort((a, b) => a.month - b.month);

  for (let i = 0; i < sorted.length; i++) {
    const m = sorted[i];
    const pct = ((m.month - minMonth) / range) * 100;

    // Default to top
    let pos: 'top' | 'insideTopLeft' | 'insideTopRight' | 'insideTop' = 'top';

    // Near right edge — shift left
    if (pct > 85) pos = 'insideTopLeft';
    // Near left edge — shift right
    else if (pct < 15) pos = 'insideTopRight';

    // Check proximity to other markers
    for (let j = 0; j < sorted.length; j++) {
      if (i === j) continue;
      const otherPct = ((sorted[j].month - minMonth) / range) * 100;
      const dist = Math.abs(pct - otherPct);
      if (dist < 8) {
        // Too close — stagger: earlier marker goes left, later goes right
        if (m.month <= sorted[j].month) {
          pos = 'insideTopRight';
        } else {
          pos = 'insideTopLeft';
        }
      }
    }

    positions[m.key] = pos;
  }

  return positions;
}

export function TimelinePosition({ timeline, adaptation, locale }: TimelinePositionProps) {
  const t = useTranslations('results');
  const lang = locale as 'en' | 'de';

  const userMonth = dateToMonth(timeline.timelinePosition);
  const frontierMonth = dateToMonth(timeline.frontier);

  // Projected position
  let projectedMonth: number | null = null;
  let projectedColor = '#eab308';
  if (adaptation) {
    const projectedDate = subtractMonths(timeline.frontier, adaptation.projectedGap12Months);
    projectedMonth = Math.max(MIN_MONTH, Math.min(dateToMonth(projectedDate), MAX_MONTH));
    projectedColor = DIRECTION_COLORS[adaptation.direction] ?? '#eab308';
  }

  // Build markers for label collision detection
  const markers: { key: string; month: number }[] = [
    { key: 'user', month: userMonth },
    { key: 'frontier', month: frontierMonth },
  ];
  if (projectedMonth !== null) {
    markers.push({ key: 'projected', month: projectedMonth });
  }
  const labelPositions = computeLabelPositions(markers, MIN_MONTH, MAX_MONTH);

  // Dummy data point to render the chart area
  const data = [{ x: MIN_MONTH, y: 0 }];

  const yearTicks = [2022, 2023, 2024, 2025, 2026].map((y) => y * 12 + 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>{t('timelineTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart data={data} margin={{ top: 40, right: 20, bottom: 40, left: 20 }}>
              <XAxis
                dataKey="x"
                type="number"
                domain={[MIN_MONTH, MAX_MONTH]}
                ticks={yearTicks}
                tickFormatter={(val: number) => String(Math.floor(val / 12))}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#6b7280' }}
              />
              <YAxis hide domain={[0, 1]} />

              {/* Era background bands */}
              {ERA_BANDS.map((band) => (
                <ReferenceArea
                  key={band.tier}
                  x1={band.startMonth}
                  x2={band.endMonth}
                  y1={0}
                  y2={1}
                  fill={band.color}
                  fillOpacity={1}
                  stroke="none"
                >
                  <Label
                    value={TIER_CONFIG[band.tier][lang]}
                    position="insideBottom"
                    offset={8}
                    style={{ fontSize: 9, fill: '#6b7280' }}
                  />
                </ReferenceArea>
              ))}

              {/* Filled bar from start to user position */}
              <ReferenceArea
                x1={MIN_MONTH}
                x2={Math.min(userMonth, MAX_MONTH)}
                y1={0.45}
                y2={0.55}
                fill="#FFAB54"
                fillOpacity={1}
                stroke="none"
                radius={4}
              />

              {/* Gray bar from user to end */}
              <ReferenceArea
                x1={Math.min(userMonth, MAX_MONTH)}
                x2={MAX_MONTH}
                y1={0.45}
                y2={0.55}
                fill="#d1d5db"
                fillOpacity={1}
                stroke="none"
                radius={4}
              />

              {/* Gap label between user and frontier */}
              {timeline.frontierAheadMonths > 0 && (
                <ReferenceArea
                  x1={userMonth}
                  x2={frontierMonth}
                  y1={0.6}
                  y2={0.75}
                  fill="transparent"
                  stroke="none"
                >
                  <Label
                    value={`← ${timeline.frontierAheadMonths} ${t('monthsBehind')} →`}
                    position="center"
                    style={{
                      fontSize: 11,
                      fill: '#6b7280',
                      fontWeight: 500,
                    }}
                  />
                </ReferenceArea>
              )}

              {/* Projected dashed line */}
              {projectedMonth !== null && (
                <ReferenceLine
                  x={projectedMonth}
                  stroke={projectedColor}
                  strokeDasharray="4 4"
                  strokeWidth={2}
                >
                  <Label
                    value={lang === 'de' ? 'Prognose' : 'Projected'}
                    position={labelPositions['projected'] ?? 'top'}
                    offset={15}
                    style={{ fontSize: 10, fill: projectedColor, fontWeight: 600 }}
                  />
                </ReferenceLine>
              )}

              {/* Dashed connector from user to projected */}
              {projectedMonth !== null && (
                <ReferenceArea
                  x1={Math.min(userMonth, projectedMonth)}
                  x2={Math.max(userMonth, projectedMonth)}
                  y1={0.48}
                  y2={0.52}
                  fill="transparent"
                  stroke={projectedColor}
                  strokeDasharray="4 4"
                  strokeOpacity={0.5}
                />
              )}

              {/* User marker line */}
              <ReferenceLine
                x={userMonth}
                stroke="#121212"
                strokeWidth={2}
              >
                <Label
                  value={`◆ ${t('you').toUpperCase()}`}
                  position={labelPositions['user'] ?? 'top'}
                  offset={15}
                  style={{ fontSize: 11, fill: '#121212', fontWeight: 700 }}
                />
                <Label
                  value={timeline.timelinePositionLabel}
                  position={labelPositions['user'] ?? 'top'}
                  offset={28}
                  style={{ fontSize: 10, fill: '#6b7280' }}
                />
              </ReferenceLine>

              {/* Frontier marker line */}
              <ReferenceLine
                x={frontierMonth}
                stroke="#FFAB54"
                strokeWidth={2}
              >
                <Label
                  value={`★ ${t('frontier').toUpperCase()}`}
                  position={labelPositions['frontier'] ?? 'top'}
                  offset={15}
                  style={{ fontSize: 11, fill: '#FFAB54', fontWeight: 700 }}
                />
                <Label
                  value={timeline.frontier}
                  position={labelPositions['frontier'] ?? 'top'}
                  offset={28}
                  style={{ fontSize: 10, fill: '#6b7280' }}
                />
              </ReferenceLine>
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}
