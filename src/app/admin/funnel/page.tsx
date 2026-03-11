'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FunnelChart } from '@/components/admin/FunnelChart';

const labels = {
  en: {
    title: 'Funnel Analytics',
    backToAdmin: 'Back to Admin',
    overallConversion: 'Overall Conversion',
    biggestDropOff: 'Biggest Drop-off',
    totalSteps: 'Steps Tracked',
    funnelVisualization: 'Funnel Visualization',
    stepDetails: 'Step Details',
    filters: 'Filters',
    campaignSource: 'Campaign Source',
    campaignSourcePlaceholder: 'e.g. card-a',
    dateFrom: 'From',
    dateTo: 'To',
    apply: 'Apply',
    step: 'Step',
    entered: 'Entered',
    completed: 'Completed',
    dropOff: 'Drop-off %',
    medianTime: 'Median Time',
    loading: 'Loading...',
    noData: 'No funnel data yet.',
    atStep: 'at step',
  },
  de: {
    title: 'Funnel-Analyse',
    backToAdmin: 'Zuruck zur Admin-Seite',
    overallConversion: 'Gesamt-Conversion',
    biggestDropOff: 'Grosster Abbruch',
    totalSteps: 'Schritte erfasst',
    funnelVisualization: 'Funnel-Visualisierung',
    stepDetails: 'Schrittdetails',
    filters: 'Filter',
    campaignSource: 'Kampagnenquelle',
    campaignSourcePlaceholder: 'z.B. card-a',
    dateFrom: 'Von',
    dateTo: 'Bis',
    apply: 'Anwenden',
    step: 'Schritt',
    entered: 'Eingetreten',
    completed: 'Abgeschlossen',
    dropOff: 'Abbruch %',
    medianTime: 'Median-Zeit',
    loading: 'Laden...',
    noData: 'Noch keine Funnel-Daten.',
    atStep: 'bei Schritt',
  },
} as const;

interface FunnelStep {
  step: string;
  entered: number;
  completed: number;
  dropOffRate: number;
  medianTimeSeconds: number | null;
}

interface FunnelData {
  steps: FunnelStep[];
  overallConversion: number;
  biggestDropOff: { step: string; rate: number };
}

export default function FunnelPage() {
  const locale = useLocale() as 'en' | 'de';
  const t = labels[locale] || labels.en;

  const [data, setData] = useState<FunnelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [srcFilter, setSrcFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  function fetchData(src?: string, from?: string, to?: string) {
    setLoading(true);
    const params = new URLSearchParams();
    if (src) params.set('src', src);
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const qs = params.toString();

    fetch(`/api/admin/funnel${qs ? `?${qs}` : ''}`)
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => console.error('Failed to load funnel data:', err))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchData();
  }, []);

  function handleApplyFilters() {
    fetchData(srcFilter || undefined, fromDate || undefined, toDate || undefined);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        {t.loading}
      </div>
    );
  }

  const steps = data?.steps || [];
  const hasData = steps.some((s) => s.entered > 0);

  return (
    <div className="px-4 py-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-[#121212]">{t.title}</h1>
        <Link href="/admin">
          <Button variant="outline" size="sm">{t.backToAdmin}</Button>
        </Link>
      </div>

      {/* Filter controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{t.filters}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">{t.campaignSource}</label>
              <Input
                placeholder={t.campaignSourcePlaceholder}
                value={srcFilter}
                onChange={(e) => setSrcFilter(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">{t.dateFrom}</label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">{t.dateTo}</label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-40"
              />
            </div>
            <Button onClick={handleApplyFilters} size="sm">{t.apply}</Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary cards */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">{t.overallConversion}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{data.overallConversion}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">{t.biggestDropOff}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#ef4444]">{data.biggestDropOff.rate}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                {t.atStep} <span className="capitalize">{data.biggestDropOff.step.replace(/_/g, ' ')}</span>
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">{t.totalSteps}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{steps.filter((s) => s.entered > 0).length}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {!hasData ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-muted-foreground text-sm text-center">{t.noData}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Funnel visualization */}
          <Card>
            <CardHeader>
              <CardTitle>{t.funnelVisualization}</CardTitle>
            </CardHeader>
            <CardContent>
              <FunnelChart
                steps={steps}
                enteredLabel={t.entered}
                dropOffLabel={t.dropOff}
              />
            </CardContent>
          </Card>

          {/* Step details table */}
          <Card>
            <CardHeader>
              <CardTitle>{t.stepDetails}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.step}</TableHead>
                    <TableHead>{t.entered}</TableHead>
                    <TableHead>{t.completed}</TableHead>
                    <TableHead>{t.dropOff}</TableHead>
                    <TableHead>{t.medianTime}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {steps.map((s) => (
                    <TableRow
                      key={s.step}
                      className={s.dropOffRate > 20 ? 'bg-red-50' : ''}
                    >
                      <TableCell className="capitalize font-medium">
                        {s.step.replace(/_/g, ' ')}
                      </TableCell>
                      <TableCell>{s.entered}</TableCell>
                      <TableCell>{s.completed}</TableCell>
                      <TableCell className={s.dropOffRate > 20 ? 'text-red-600 font-bold' : ''}>
                        {s.dropOffRate}%
                      </TableCell>
                      <TableCell>
                        {s.medianTimeSeconds !== null ? `${s.medianTimeSeconds}s` : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
