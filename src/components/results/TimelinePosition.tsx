'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  ComposedChart,
  Line,
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

const MIN_MONTH = 2022 * 12 + 1;
const MAX_MONTH = 2027 * 12 + 1;

// When user and frontier are within this many months, stagger labels vertically
const CLOSE_THRESHOLD_MONTHS = 8;

// Custom label renderer for marker labels with full positioning control
function MarkerLabel({
  viewBox,
  label1,
  label2,
  color,
  above,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  viewBox?: any;
  label1: string;
  label2: string;
  color: string;
  above: boolean; // true = above the bar, false = below
}) {
  if (!viewBox) return null;
  const { x } = viewBox;
  const yBase = above ? viewBox.y - 8 : viewBox.y + viewBox.height + 36;
  const textAnchor = 'middle';
  return (
    <g>
      <text
        x={x}
        y={yBase}
        textAnchor={textAnchor}
        fill={color}
        fontSize={11}
        fontWeight={700}
      >
        {label1}
      </text>
      <text
        x={x}
        y={yBase + (above ? -14 : 14)}
        textAnchor={textAnchor}
        fill="#6b7280"
        fontSize={10}
      >
        {label2}
      </text>
    </g>
  );
}

export function TimelinePosition({ timeline, adaptation, locale }: TimelinePositionProps) {
  const t = useTranslations('results');
  const lang = locale as 'en' | 'de';

  const userMonth = dateToMonth(timeline.timelinePosition);
  const frontierMonth = dateToMonth(timeline.frontier);
  const markersAreClose = Math.abs(frontierMonth - userMonth) < CLOSE_THRESHOLD_MONTHS;

  // Two invisible data points spanning the full domain to anchor the chart area
  const data = [
    { x: MIN_MONTH, y: 0.5 },
    { x: MAX_MONTH, y: 0.5 },
  ];

  const yearTicks = [2022, 2023, 2024, 2025, 2026].map((y) => y * 12 + 1);

  // Frontier sub-label: when staggered, include gap info
  const frontierSub = markersAreClose && timeline.frontierAheadMonths > 0
    ? `${timeline.frontier} · ${timeline.frontierAheadMonths} ${t('monthsBehind')}`
    : timeline.frontier;

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
          <ResponsiveContainer width="100%" height={markersAreClose ? 260 : 220}>
            <ComposedChart data={data} margin={{ top: 50, right: 30, bottom: markersAreClose ? 70 : 50, left: 30 }}>
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

              {/* Invisible line to anchor the chart coordinate system */}
              <Line dataKey="y" stroke="transparent" dot={false} isAnimationActive={false} />

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

              {/* Gap label between user and frontier — only when not staggered */}
              {timeline.frontierAheadMonths > 0 && !markersAreClose && (
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

              {/* User marker line — always labeled above */}
              <ReferenceLine
                x={userMonth}
                stroke="#121212"
                strokeWidth={2}
              >
                <Label
                  content={
                    <MarkerLabel
                      label1={`◆ ${t('you').toUpperCase()}`}
                      label2={timeline.timelinePositionLabel}
                      color="#121212"
                      above={true}
                    />
                  }
                />
              </ReferenceLine>

              {/* Frontier marker line — below bar when close, above otherwise */}
              <ReferenceLine
                x={frontierMonth}
                stroke="#FFAB54"
                strokeWidth={2}
              >
                <Label
                  content={
                    <MarkerLabel
                      label1={`★ ${t('frontier').toUpperCase()}`}
                      label2={frontierSub}
                      color="#FFAB54"
                      above={!markersAreClose}
                    />
                  }
                />
              </ReferenceLine>
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}
