'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { TIER_CONFIG } from '@/lib/features/types';
import type { ScoreResult } from '@/lib/scoring';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TimelinePositionProps {
  timeline: ScoreResult['timeline'];
  adaptation?: ScoreResult['adaptation'];
  locale: string;
}

// Map tier eras to approximate date ranges for background bands
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

export function TimelinePosition({ timeline, adaptation, locale }: TimelinePositionProps) {
  const t = useTranslations('results');
  const lang = locale as 'en' | 'de';

  const minMonth = 2022 * 12 + 1;
  const maxMonth = 2027 * 12 + 1;
  const range = maxMonth - minMonth;

  const userPos = monthToFraction(timeline.timelinePosition, minMonth, range);
  const frontierPos = monthToFraction(timeline.frontier, minMonth, range);

  // Calculate projected position
  let projectedPos: number | null = null;
  let projectedColor = '#eab308';
  if (adaptation) {
    const projectedDate = subtractMonths(timeline.frontier, adaptation.projectedGap12Months);
    projectedPos = monthToFraction(projectedDate, minMonth, range);
    projectedPos = Math.max(0, Math.min(projectedPos, 100));
    projectedColor = DIRECTION_COLORS[adaptation.direction] ?? '#eab308';
  }

  const yearMarkers = [2022, 2023, 2024, 2025, 2026];

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
          <div className="relative w-full pt-8 pb-16">
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
            <div className="relative h-1 bg-gray-300 rounded-full mx-4 mt-10">
              {/* Filled portion up to user position */}
              <div
                className="absolute h-full bg-[#FFAB54] rounded-full"
                style={{ width: `${Math.min(userPos, 100)}%` }}
              />
            </div>

            {/* User marker */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="absolute flex flex-col items-center"
              style={{ left: `${Math.min(userPos, 98)}%`, top: '0.5rem' }}
            >
              <span className="text-lg">&#9670;</span>
              <span className="text-[10px] font-semibold whitespace-nowrap mt-0.5">
                {t('you').toUpperCase()}
              </span>
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                {timeline.timelinePositionLabel}
              </span>
            </motion.div>

            {/* Frontier marker */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="absolute flex flex-col items-center"
              style={{ left: `${Math.min(frontierPos, 98)}%`, top: '0.5rem' }}
            >
              <span className="text-lg text-[#FFAB54]">&#9733;</span>
              <span className="text-[10px] font-semibold whitespace-nowrap mt-0.5 text-[#FFAB54]">
                {t('frontier').toUpperCase()}
              </span>
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                {timeline.frontier}
              </span>
            </motion.div>

            {/* Projected position line */}
            {adaptation && projectedPos !== null && (
              <>
                {/* Dashed connecting line from current to projected */}
                <div
                  className="absolute"
                  style={{
                    left: `${Math.min(userPos, projectedPos)}%`,
                    width: `${Math.abs(projectedPos - userPos)}%`,
                    top: '3.25rem',
                    height: '0px',
                    borderTop: `2px dashed ${projectedColor}`,
                    opacity: 0.5,
                  }}
                />

                {/* Projected dashed vertical line */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="absolute"
                  style={{
                    left: `${Math.min(projectedPos, 98)}%`,
                    top: '0.5rem',
                    bottom: '4rem',
                    width: '0px',
                    borderLeft: `2px dashed ${projectedColor}`,
                  }}
                />

                {/* Projected label */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.65 }}
                  className="absolute flex flex-col items-center"
                  style={{ left: `${Math.min(projectedPos, 96)}%`, top: '0' }}
                >
                  <span
                    className="text-[9px] font-semibold whitespace-nowrap"
                    style={{ color: projectedColor }}
                  >
                    {lang === 'de' ? 'Prognose' : 'Projected'}
                  </span>
                </motion.div>
              </>
            )}

            {/* Gap label */}
            {timeline.frontierAheadMonths > 0 && (
              <div
                className="absolute flex items-center justify-center"
                style={{
                  left: `${userPos}%`,
                  width: `${frontierPos - userPos}%`,
                  top: '4.5rem',
                }}
              >
                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap bg-white px-2 py-0.5 rounded border">
                  &larr; {timeline.frontierAheadMonths} {t('monthsBehind')} &rarr;
                </span>
              </div>
            )}

            {/* Year markers */}
            <div className="relative mt-2 mx-4">
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
