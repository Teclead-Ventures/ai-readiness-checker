'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface FunnelStep {
  step: string;
  entered: number;
  completed: number;
  dropOffRate: number;
  medianTimeSeconds: number | null;
}

interface FunnelChartProps {
  steps: FunnelStep[];
  enteredLabel?: string;
  dropOffLabel?: string;
}

export function FunnelChart({
  steps,
  enteredLabel = 'Entered',
  dropOffLabel = 'Drop-off',
}: FunnelChartProps) {
  const maxEntered = Math.max(...steps.map((s) => s.entered), 1);

  const data = steps.map((s) => ({
    name: s.step.replace(/_/g, ' '),
    entered: s.entered,
    dropOffRate: s.dropOffRate,
    medianTime: s.medianTimeSeconds,
    widthPct: Math.round((s.entered / maxEntered) * 100),
  }));

  return (
    <div className="space-y-1">
      {/* Horizontal funnel bars */}
      {data.map((step, i) => {
        const isHighDropOff = step.dropOffRate > 20;
        const barColor = isHighDropOff ? '#ef4444' : '#FFAB54';

        return (
          <div key={step.name} className="flex items-center gap-3">
            <div className="w-32 text-xs text-right truncate capitalize" title={step.name}>
              {step.name}
            </div>
            <div className="flex-1 relative h-8">
              <div
                className="h-full rounded transition-all"
                style={{
                  width: `${step.widthPct}%`,
                  backgroundColor: barColor,
                  minWidth: step.entered > 0 ? '4px' : '0px',
                }}
              />
            </div>
            <div className="w-16 text-xs text-right font-medium">{step.entered}</div>
            <div
              className={`w-16 text-xs text-right ${isHighDropOff ? 'text-red-600 font-bold' : 'text-muted-foreground'}`}
            >
              {step.dropOffRate}%
            </div>
            <div className="w-14 text-xs text-right text-muted-foreground">
              {step.medianTime !== null ? `${step.medianTime}s` : '-'}
            </div>
          </div>
        );
      })}
      {/* Legend row */}
      <div className="flex items-center gap-3 pt-2 border-t text-xs text-muted-foreground">
        <div className="w-32 text-right font-medium">Step</div>
        <div className="flex-1" />
        <div className="w-16 text-right font-medium">{enteredLabel}</div>
        <div className="w-16 text-right font-medium">{dropOffLabel}</div>
        <div className="w-14 text-right font-medium">Time</div>
      </div>
    </div>
  );
}
