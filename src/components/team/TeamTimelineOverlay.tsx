'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { TIER_CONFIG } from '@/lib/features/types';
import type { ScoreResult } from '@/lib/scoring';
import type { SurveyResponse } from '@/types/survey';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TeamTimelineOverlayProps {
  responses: SurveyResponse[];
  anonymous: boolean;
  locale: string;
}

// Reuse ERA_BANDS from TimelinePosition
const ERA_BANDS = [
  { tier: 1 as const, start: '2022-01', end: '2023-06', color: '#22c55e20' },
  { tier: 2 as const, start: '2023-06', end: '2024-06', color: '#3b82f620' },
  { tier: 3 as const, start: '2024-06', end: '2025-01', color: '#eab30820' },
  { tier: 4 as const, start: '2025-01', end: '2025-12', color: '#f9731620' },
  { tier: 5 as const, start: '2025-12', end: '2027-01', color: '#a855f720' },
];

function monthToFraction(dateStr: string, minMonth: number, range: number): number {
  const [y, m] = dateStr.split('-').map(Number);
  const month = y * 12 + m;
  return ((month - minMonth) / range) * 100;
}

function monthsBetween(a: string, b: string): number {
  const [ay, am] = a.split('-').map(Number);
  const [by, bm] = b.split('-').map(Number);
  return (by - ay) * 12 + (bm - am);
}

const DIRECTION_COLORS: Record<string, string> = {
  closing: '#22c55e',
  stable: '#eab308',
  widening: '#ef4444',
};

export function TeamTimelineOverlay({
  responses,
  anonymous,
  locale,
}: TeamTimelineOverlayProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const lang = locale as 'en' | 'de';

  const minMonth = 2022 * 12 + 1;
  const maxMonth = 2027 * 12 + 1;
  const range = maxMonth - minMonth;

  const yearMarkers = [2022, 2023, 2024, 2025, 2026];

  // Calculate team average timeline position
  const positions = responses
    .map((r) => r.scores?.timeline?.timelinePosition)
    .filter(Boolean) as string[];

  if (positions.length === 0) return null;

  const avgMonthValue =
    positions.reduce((sum, pos) => {
      const [y, m] = pos.split('-').map(Number);
      return sum + y * 12 + m;
    }, 0) / positions.length;

  const avgYear = Math.floor(avgMonthValue / 12);
  const avgMonth = Math.round(avgMonthValue % 12);
  const avgPos = ((avgMonthValue - minMonth) / range) * 100;

  // Frontier: rightmost position across all responses
  const frontierPositions = responses
    .map((r) => r.scores?.timeline?.frontier)
    .filter(Boolean) as string[];

  const frontierDate =
    frontierPositions.length > 0
      ? frontierPositions.sort((a, b) => b.localeCompare(a))[0]
      : '2026-02';

  const frontierPos = monthToFraction(frontierDate, minMonth, range);

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
          <div className="relative w-full pt-10 pb-16">
            {/* Era background bands */}
            {ERA_BANDS.map((band) => {
              const left = monthToFraction(band.start, minMonth, range);
              const right = monthToFraction(band.end, minMonth, range);
              return (
                <div
                  key={band.tier}
                  className="absolute top-0 bottom-0 rounded"
                  style={{
                    left: `${left}%`,
                    width: `${right - left}%`,
                    backgroundColor: band.color,
                  }}
                />
              );
            })}

            {/* Main timeline bar */}
            <div className="relative h-1 bg-gray-300 rounded-full mx-4 mt-6" />

            {/* Team average dashed line */}
            <div
              className="absolute top-0 bottom-12"
              style={{
                left: `${Math.min(avgPos, 98)}%`,
                width: '2px',
                borderLeft: '2px dashed #FFAB54',
              }}
            />
            <div
              className="absolute text-[10px] font-semibold text-[#FFAB54] whitespace-nowrap -translate-x-1/2"
              style={{
                left: `${Math.min(avgPos, 98)}%`,
                top: '0',
              }}
            >
              {lang === 'de' ? 'Team-Durchschnitt' : 'Team Average'}
            </div>

            {/* Member dots */}
            {responses.map((r, i) => {
              const timelinePos = r.scores?.timeline?.timelinePosition;
              if (!timelinePos) return null;

              const xPos = monthToFraction(timelinePos, minMonth, range);
              const direction = r.scores?.adaptation?.direction ?? 'stable';
              const dotColor = DIRECTION_COLORS[direction] ?? '#eab308';
              const name = anonymous
                ? `Member ${i + 1}`
                : r.respondent_name || `Member ${i + 1}`;

              return (
                <div key={r.id ?? i}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 + i * 0.05 }}
                    className="absolute cursor-pointer"
                    style={{
                      left: `${Math.min(xPos, 97)}%`,
                      top: '3rem',
                      transform: 'translate(-50%, -50%)',
                    }}
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <div
                      className="w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: dotColor }}
                    />
                  </motion.div>

                  {/* Tooltip */}
                  {hoveredIndex === i && (
                    <div
                      className="absolute z-10 bg-white rounded-lg shadow-lg border px-3 py-2 text-xs whitespace-nowrap"
                      style={{
                        left: `${Math.min(xPos, 90)}%`,
                        top: '1rem',
                        transform: 'translateX(-50%)',
                      }}
                    >
                      <div className="font-semibold text-[#121212]">{name}</div>
                      <div className="text-muted-foreground mt-0.5">
                        {lang === 'de' ? 'Score' : 'Score'}: {r.scores?.overall ?? '—'}
                      </div>
                      <div className="text-muted-foreground">
                        {lang === 'de' ? 'Abstand' : 'Gap'}:{' '}
                        {r.scores?.timeline?.frontierAheadMonths ?? '—'}{' '}
                        {lang === 'de' ? 'Monate' : 'months'}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Frontier marker */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="absolute flex flex-col items-center"
              style={{
                left: `${Math.min(frontierPos, 98)}%`,
                top: '0.5rem',
              }}
            >
              <span className="text-lg text-[#FFAB54]">&#9733;</span>
            </motion.div>

            {/* Year markers */}
            <div className="relative mt-4 mx-4">
              {yearMarkers.map((year) => {
                const pos = monthToFraction(`${year}-01`, minMonth, range);
                return (
                  <span
                    key={year}
                    className="absolute text-[10px] text-muted-foreground -translate-x-1/2"
                    style={{ left: `${pos}%` }}
                  >
                    {year}
                  </span>
                );
              })}
            </div>

            {/* Era labels */}
            <div className="relative mt-6 mx-4">
              {ERA_BANDS.map((band) => {
                const left = monthToFraction(band.start, minMonth, range);
                const right = monthToFraction(band.end, minMonth, range);
                const center = (left + right) / 2;
                return (
                  <span
                    key={band.tier}
                    className="absolute text-[9px] text-muted-foreground -translate-x-1/2 text-center whitespace-nowrap"
                    style={{ left: `${center}%` }}
                  >
                    {TIER_CONFIG[band.tier][lang]}
                  </span>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
