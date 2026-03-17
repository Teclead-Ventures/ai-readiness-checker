'use client';

import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { getScoreLabel } from '@/types/survey';

interface ReadinessGaugeProps {
  score: number;
  locale: string;
}

export function ReadinessGauge({ score, locale }: ReadinessGaugeProps) {
  const t = useTranslations('results');
  const label = getScoreLabel(score);

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeWidth = 12;
  const size = (radius + strokeWidth) * 2;
  const center = size / 2;

  const progress = useMotionValue(0);
  const dashOffset = useTransform(progress, (v: number) => circumference - (v / 100) * circumference);

  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const unsubscribe = progress.on('change', (v: number) => {
      setDisplayScore(Math.round(v));
    });
    const controls = animate(progress, score, {
      duration: 1.5,
      ease: 'easeOut',
    });
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [score, progress]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center"
    >
      <p className="text-sm font-medium text-muted-foreground mb-2">{t('overall')}</p>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-gray-200"
          />
          {/* Progress circle */}
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={label.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            style={{ strokeDashoffset: dashOffset }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-bold text-foreground">
            {displayScore}
          </span>
          <span className="text-sm font-medium mt-1" style={{ color: label.color }}>
            {label.label[locale as 'en' | 'de'] ?? label.label.en}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
