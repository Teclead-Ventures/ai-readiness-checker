'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CampaignChart } from '@/components/admin/CampaignChart';

const labels = {
  en: {
    title: 'Campaign Performance',
    backToAdmin: 'Back to Admin',
    totalVisits: 'Total Visits',
    totalCompletions: 'Total Completions',
    overallConversion: 'Overall Conversion',
    campaignGroups: 'Campaign Groups',
    visitsVsCompletions: 'Visits vs Completions',
    dailyVisits: 'Daily Visits Over Time',
    visits: 'Visits',
    completions: 'Completions',
    conversionRate: 'Conversion %',
    src: 'Source',
    cards: 'Cards',
    cid: 'Card ID',
    loading: 'Loading...',
    noData: 'No campaign data yet.',
    expand: 'Show cards',
    collapse: 'Hide cards',
  },
  de: {
    title: 'Kampagnen-Performance',
    backToAdmin: 'Zuruck zur Admin-Seite',
    totalVisits: 'Besuche gesamt',
    totalCompletions: 'Abschlusse gesamt',
    overallConversion: 'Gesamt-Conversion',
    campaignGroups: 'Kampagnengruppen',
    visitsVsCompletions: 'Besuche vs Abschlusse',
    dailyVisits: 'Tagliche Besuche',
    visits: 'Besuche',
    completions: 'Abschlusse',
    conversionRate: 'Conversion %',
    src: 'Quelle',
    cards: 'Karten',
    cid: 'Karten-ID',
    loading: 'Laden...',
    noData: 'Noch keine Kampagnendaten.',
    expand: 'Karten anzeigen',
    collapse: 'Karten ausblenden',
  },
} as const;

interface DailyCount {
  date: string;
  count: number;
}

interface CardBreakdown {
  cid: string;
  visits: number;
  completions: number;
}

interface CampaignGroup {
  src: string;
  visits: number;
  completions: number;
  conversionRate: number;
  dailyVisits: DailyCount[];
  dailyCompletions: DailyCount[];
  topCards: CardBreakdown[];
}

interface CampaignData {
  groups: CampaignGroup[];
}

// Generate distinct colors for line chart
const LINE_COLORS = ['#FFAB54', '#3b82f6', '#22c55e', '#ef4444', '#a855f7', '#eab308', '#06b6d4', '#ec4899'];

export default function CampaignsPage() {
  const locale = useLocale() as 'en' | 'de';
  const t = labels[locale] || labels.en;

  const [data, setData] = useState<CampaignData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch('/api/admin/campaigns')
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => console.error('Failed to load campaign data:', err))
      .finally(() => setLoading(false));
  }, []);

  function toggleExpand(src: string) {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(src)) next.delete(src);
      else next.add(src);
      return next;
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        {t.loading}
      </div>
    );
  }

  const groups = data?.groups || [];
  const totalVisits = groups.reduce((s, g) => s + g.visits, 0);
  const totalCompletions = groups.reduce((s, g) => s + g.completions, 0);
  const overallConversion = totalVisits > 0
    ? Math.round((totalCompletions / totalVisits) * 10000) / 100
    : 0;

  // Build daily data for line chart: merge all groups' daily visits into a single dataset
  const allDatesSet = new Set<string>();
  for (const g of groups) {
    for (const d of g.dailyVisits) allDatesSet.add(d.date);
  }
  const allDates = Array.from(allDatesSet).sort();

  const dailyChartData = allDates.map((date) => {
    const row: Record<string, string | number> = { date };
    for (const g of groups) {
      const dv = g.dailyVisits.find((d) => d.date === date);
      row[g.src] = dv?.count || 0;
    }
    return row;
  });

  return (
    <div className="px-4 py-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-[#121212]">{t.title}</h1>
        <Link href="/admin">
          <Button variant="outline" size="sm">{t.backToAdmin}</Button>
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">{t.totalVisits}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalVisits}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">{t.totalCompletions}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalCompletions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">{t.overallConversion}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{overallConversion}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">{t.campaignGroups}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{groups.length}</div>
          </CardContent>
        </Card>
      </div>

      {groups.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-muted-foreground text-sm text-center">{t.noData}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Bar chart: visits vs completions per group */}
          <Card>
            <CardHeader>
              <CardTitle>{t.visitsVsCompletions}</CardTitle>
            </CardHeader>
            <CardContent>
              <CampaignChart
                groups={groups}
                visitLabel={t.visits}
                completionLabel={t.completions}
              />
            </CardContent>
          </Card>

          {/* Line chart: daily visits over time */}
          <Card>
            <CardHeader>
              <CardTitle>{t.dailyVisits}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyChartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {groups.map((g, i) => (
                    <Line
                      key={g.src}
                      type="monotone"
                      dataKey={g.src}
                      stroke={LINE_COLORS[i % LINE_COLORS.length]}
                      strokeWidth={2}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Data table */}
          <Card>
            <CardHeader>
              <CardTitle>{t.campaignGroups}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.src}</TableHead>
                    <TableHead>{t.visits}</TableHead>
                    <TableHead>{t.completions}</TableHead>
                    <TableHead>{t.conversionRate}</TableHead>
                    <TableHead>{t.cards}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groups.map((g) => (
                    <>
                      <TableRow key={g.src}>
                        <TableCell className="font-medium">{g.src}</TableCell>
                        <TableCell>{g.visits}</TableCell>
                        <TableCell>{g.completions}</TableCell>
                        <TableCell>{g.conversionRate}%</TableCell>
                        <TableCell>
                          {g.topCards.length > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExpand(g.src)}
                            >
                              {expandedRows.has(g.src) ? t.collapse : t.expand}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                      {expandedRows.has(g.src) && g.topCards.map((card) => (
                        <TableRow key={`${g.src}-${card.cid}`} className="bg-muted/30">
                          <TableCell className="pl-8 text-muted-foreground text-xs">
                            {t.cid}: {card.cid}
                          </TableCell>
                          <TableCell className="text-xs">{card.visits}</TableCell>
                          <TableCell className="text-xs">{card.completions}</TableCell>
                          <TableCell className="text-xs">
                            {card.visits > 0 ? Math.round((card.completions / card.visits) * 100) : 0}%
                          </TableCell>
                          <TableCell />
                        </TableRow>
                      ))}
                    </>
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
