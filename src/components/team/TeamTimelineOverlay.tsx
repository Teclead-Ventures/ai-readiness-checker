'use client';

import { motion } from 'framer-motion';
import {
  ComposedChart,
  XAxis,
  YAxis,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  Label,
  Cell,
} from 'recharts';
import { TIER_CONFIG } from '@/lib/features/types';
import { ERA_BANDS, dateToMonth } from '@/components/results/TimelinePosition';
import type { SurveyResponse } from '@/types/survey';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TeamTimelineOverlayProps {
  responses: SurveyResponse[];
  anonymous: boolean;
  locale: string;
}

const DIRECTION_COLORS: Record<string, string> = {
  closing: '#22c55e',
  stable: '#eab308',
  widening: '#ef4444',
};

const MIN_MONTH = 2022 * 12 + 1;
const MAX_MONTH = 2027 * 12 + 1;

interface MemberPoint {
  x: number;
  y: number;
  name: string;
  score: number;
  gap: number;
  direction: string;
  color: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload as MemberPoint;
  return (
    <div className="bg-white rounded-lg shadow-lg border px-3 py-2 text-xs">
      <div className="font-semibold text-[#121212]">{d.name}</div>
      <div className="text-muted-foreground mt-0.5">Score: {d.score}</div>
      <div className="text-muted-foreground">Gap: {d.gap} months</div>
    </div>
  );
}

export function TeamTimelineOverlay({
  responses,
  anonymous,
  locale,
}: TeamTimelineOverlayProps) {
  const lang = locale as 'en' | 'de';

  // Filter responses with valid timeline data
  const validResponses = responses.filter(
    (r) => r.scores?.timeline?.timelinePosition
  );

  if (validResponses.length === 0) return null;

  // Build scatter data — spread members vertically to avoid dot overlap
  const memberData: MemberPoint[] = validResponses.map((r, i) => {
    const direction = r.scores?.adaptation?.direction ?? 'stable';
    const name = anonymous
      ? `Member ${i + 1}`
      : r.respondent_name || `Member ${i + 1}`;
    return {
      x: dateToMonth(r.scores!.timeline.timelinePosition),
      y: 0.3 + (i % 3) * 0.15, // stagger vertically
      name,
      score: r.scores?.overall ?? 0,
      gap: r.scores?.timeline?.frontierAheadMonths ?? 0,
      direction,
      color: DIRECTION_COLORS[direction] ?? '#eab308',
    };
  });

  // Team average month
  const avgMonthValue =
    validResponses.reduce((sum, r) => {
      return sum + dateToMonth(r.scores!.timeline.timelinePosition);
    }, 0) / validResponses.length;

  // Frontier: latest across all responses
  const frontierDates = validResponses
    .map((r) => r.scores?.timeline?.frontier)
    .filter(Boolean) as string[];
  const frontierDate =
    frontierDates.length > 0
      ? frontierDates.sort((a, b) => b.localeCompare(a))[0]
      : '2026-02';
  const frontierMonth = dateToMonth(frontierDate);

  const yearTicks = [2022, 2023, 2024, 2025, 2026].map((y) => y * 12 + 1);
  const title = lang === 'de' ? 'Team-Timeline' : 'Team Timeline';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart margin={{ top: 30, right: 20, bottom: 40, left: 20 }}>
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

              {/* Timeline bar */}
              <ReferenceArea
                x1={MIN_MONTH}
                x2={MAX_MONTH}
                y1={0.48}
                y2={0.52}
                fill="#d1d5db"
                fillOpacity={1}
                stroke="none"
                radius={4}
              />

              {/* Team average dashed line */}
              <ReferenceLine
                x={Math.round(avgMonthValue)}
                stroke="#FFAB54"
                strokeDasharray="6 3"
                strokeWidth={2}
              >
                <Label
                  value={lang === 'de' ? 'Team-Durchschnitt' : 'Team Average'}
                  position="top"
                  offset={10}
                  style={{ fontSize: 10, fill: '#FFAB54', fontWeight: 600 }}
                />
              </ReferenceLine>

              {/* Frontier marker */}
              <ReferenceLine
                x={frontierMonth}
                stroke="#FFAB54"
                strokeWidth={2}
              >
                <Label
                  value="★ FRONTIER"
                  position="insideTopLeft"
                  offset={10}
                  style={{ fontSize: 10, fill: '#FFAB54', fontWeight: 700 }}
                />
              </ReferenceLine>

              {/* Member scatter dots */}
              <Scatter data={memberData} dataKey="y">
                {memberData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.color}
                    stroke="#fff"
                    strokeWidth={2}
                    r={7}
                  />
                ))}
              </Scatter>

              <Tooltip content={<CustomTooltip />} />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}
