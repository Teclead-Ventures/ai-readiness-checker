'use client';

import React, { useEffect, useState } from 'react';
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
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CampaignChart } from '@/components/admin/CampaignChart';
import { getScoreLabel } from '@/types/survey';

const labels = {
  en: {
    title: 'Campaign Performance',
    backToAdmin: 'Back to Admin',
    totalVisits: 'Total Visits',
    totalCompletions: 'Total Completions',
    overallConversion: 'Overall Conversion',
    campaignGroups: 'Campaign Groups',
    uniqueCards: 'Unique Cards',
    bestCampaign: 'Best Campaign',
    bestCard: 'Best Card',
    visitsVsCompletions: 'Visits vs Completions',
    dailyVisits: 'Daily Visits Over Time',
    visits: 'Visits',
    completions: 'Completions',
    conversionRate: 'Conversion %',
    src: 'Source',
    cards: 'Cards',
    cid: 'Card ID',
    avgScore: 'Avg Score',
    track: 'Track',
    firstVisit: 'First Visit',
    lastVisit: 'Last Visit',
    loading: 'Loading...',
    noData: 'No campaign data yet.',
    expand: 'Show cards',
    collapse: 'Hide cards',
    campaignDetails: 'Campaign Details',
    cardPerformance: 'Card Performance (All Cards)',
    conversionByCard: 'Conversion Rate by Card',
    none: '(no card)',
    na: 'N/A',
  },
  de: {
    title: 'Kampagnen-Performance',
    backToAdmin: 'Zuruck zur Admin-Seite',
    totalVisits: 'Besuche gesamt',
    totalCompletions: 'Abschlusse gesamt',
    overallConversion: 'Gesamt-Conversion',
    campaignGroups: 'Kampagnengruppen',
    uniqueCards: 'Eindeutige Karten',
    bestCampaign: 'Beste Kampagne',
    bestCard: 'Beste Karte',
    visitsVsCompletions: 'Besuche vs Abschlusse',
    dailyVisits: 'Tagliche Besuche',
    visits: 'Besuche',
    completions: 'Abschlusse',
    conversionRate: 'Conversion %',
    src: 'Quelle',
    cards: 'Karten',
    cid: 'Karten-ID',
    avgScore: 'Durchschn. Score',
    track: 'Track',
    firstVisit: 'Erster Besuch',
    lastVisit: 'Letzter Besuch',
    loading: 'Laden...',
    noData: 'Noch keine Kampagnendaten.',
    expand: 'Karten anzeigen',
    collapse: 'Karten ausblenden',
    campaignDetails: 'Kampagnen-Details',
    cardPerformance: 'Karten-Performance (Alle Karten)',
    conversionByCard: 'Conversion-Rate pro Karte',
    none: '(keine Karte)',
    na: 'N/A',
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
  conversionRate: number;
  avgScore: number | null;
  trackDistribution: { dev: number; business: number };
  firstVisit: string | null;
  lastVisit: string | null;
}

interface CampaignGroup {
  src: string;
  visits: number;
  completions: number;
  conversionRate: number;
  avgScore: number | null;
  trackDistribution: { dev: number; business: number };
  firstVisit: string | null;
  lastVisit: string | null;
  dailyVisits: DailyCount[];
  dailyCompletions: DailyCount[];
  topCards: CardBreakdown[];
}

interface CampaignData {
  groups: CampaignGroup[];
}

const LINE_COLORS = ['#FFAB54', '#3b82f6', '#22c55e', '#ef4444', '#a855f7', '#eab308', '#06b6d4', '#ec4899'];

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString();
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-muted-foreground text-xs">-</span>;
  const label = getScoreLabel(score);
  return (
    <Badge style={{ backgroundColor: label.color, color: '#fff' }} className="text-xs">
      {score}
    </Badge>
  );
}

function TrackPill({ dev, business }: { dev: number; business: number }) {
  if (dev === 0 && business === 0) return <span className="text-muted-foreground text-xs">-</span>;
  return (
    <span className="flex gap-1 text-xs">
      {dev > 0 && <Badge variant="outline" className="text-[10px] px-1.5 py-0">Dev {dev}</Badge>}
      {business > 0 && <Badge variant="outline" className="text-[10px] px-1.5 py-0">Biz {business}</Badge>}
    </span>
  );
}

// Color a conversion rate bar segment
function conversionColor(rate: number): string {
  if (rate >= 50) return '#22c55e';
  if (rate >= 25) return '#FFAB54';
  return '#ef4444';
}

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

  // Collect all cards across all campaigns for the flat card table
  const allCards: (CardBreakdown & { src: string })[] = [];
  for (const g of groups) {
    for (const card of g.topCards) {
      allCards.push({ ...card, src: g.src });
    }
  }
  // Count unique card IDs (excluding 'none')
  const uniqueCardIds = new Set(allCards.filter((c) => c.cid !== 'none').map((c) => c.cid));

  // Best performing campaign (highest conversion with min 3 visits)
  const qualifiedGroups = groups.filter((g) => g.visits >= 3);
  const bestCampaign = qualifiedGroups.length > 0
    ? qualifiedGroups.reduce((best, g) => g.conversionRate > best.conversionRate ? g : best)
    : null;

  // Best performing card (highest conversion with min 3 visits)
  const qualifiedCards = allCards.filter((c) => c.visits >= 3 && c.cid !== 'none');
  const bestCard = qualifiedCards.length > 0
    ? qualifiedCards.reduce((best, c) => c.conversionRate > best.conversionRate ? c : best)
    : null;

  // Build daily data for line chart
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

  // Card conversion chart data (top 15 cards by visits, excluding 'none')
  const cardChartData = allCards
    .filter((c) => c.cid !== 'none')
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 15)
    .map((c) => ({
      name: `${c.src} / ${c.cid}`,
      conversionRate: c.conversionRate,
      visits: c.visits,
      completions: c.completions,
    }));

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t.title}</h1>
        <Link href="/admin">
          <Button variant="outline" size="sm">{t.backToAdmin}</Button>
        </Link>
      </div>

      {/* Summary cards - row 1 */}
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

      {/* Summary cards - row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">{t.uniqueCards}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{uniqueCardIds.size}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">{t.bestCampaign}</CardTitle>
          </CardHeader>
          <CardContent>
            {bestCampaign ? (
              <>
                <div className="text-lg font-bold truncate">{bestCampaign.src}</div>
                <p className="text-sm text-muted-foreground">
                  {bestCampaign.conversionRate}% conversion ({bestCampaign.completions}/{bestCampaign.visits})
                </p>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">{t.na}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">{t.bestCard}</CardTitle>
          </CardHeader>
          <CardContent>
            {bestCard ? (
              <>
                <div className="text-lg font-bold truncate">{bestCard.src} / {bestCard.cid}</div>
                <p className="text-sm text-muted-foreground">
                  {bestCard.conversionRate}% conversion ({bestCard.completions}/{bestCard.visits})
                </p>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">{t.na}</div>
            )}
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

          {/* Card conversion rate bar chart */}
          {cardChartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t.conversionByCard}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={Math.max(300, cardChartData.length * 40)}>
                  <BarChart data={cardChartData} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} unit="%" />
                    <YAxis type="category" dataKey="name" width={180} tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(value) => [`${value}%`, t.conversionRate]}
                      labelFormatter={(label) => String(label)}
                    />
                    <Bar dataKey="conversionRate" name={t.conversionRate} radius={[0, 4, 4, 0]}>
                      {cardChartData.map((entry, index) => (
                        <Cell key={index} fill={conversionColor(entry.conversionRate)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

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

          {/* Campaign details table with expandable card rows */}
          <Card>
            <CardHeader>
              <CardTitle>{t.campaignDetails}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.src}</TableHead>
                    <TableHead className="text-right">{t.visits}</TableHead>
                    <TableHead className="text-right">{t.completions}</TableHead>
                    <TableHead className="text-right">{t.conversionRate}</TableHead>
                    <TableHead className="text-right">{t.avgScore}</TableHead>
                    <TableHead>{t.track}</TableHead>
                    <TableHead>{t.firstVisit}</TableHead>
                    <TableHead>{t.lastVisit}</TableHead>
                    <TableHead>{t.cards}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groups.map((g) => (
                    <React.Fragment key={g.src}>
                      <TableRow className="font-medium">
                        <TableCell className="font-semibold">{g.src}</TableCell>
                        <TableCell className="text-right">{g.visits}</TableCell>
                        <TableCell className="text-right">{g.completions}</TableCell>
                        <TableCell className="text-right">
                          <span style={{ color: conversionColor(g.conversionRate) }} className="font-semibold">
                            {g.conversionRate}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <ScoreBadge score={g.avgScore} />
                        </TableCell>
                        <TableCell>
                          <TrackPill dev={g.trackDistribution.dev} business={g.trackDistribution.business} />
                        </TableCell>
                        <TableCell className="text-xs">{formatDate(g.firstVisit)}</TableCell>
                        <TableCell className="text-xs">{formatDate(g.lastVisit)}</TableCell>
                        <TableCell>
                          {g.topCards.length > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExpand(g.src)}
                            >
                              {expandedRows.has(g.src) ? t.collapse : `${t.expand} (${g.topCards.length})`}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                      {expandedRows.has(g.src) && g.topCards.map((card) => (
                        <TableRow key={`${g.src}-${card.cid}`} className="bg-muted/30">
                          <TableCell className="pl-8 text-muted-foreground text-xs">
                            {card.cid === 'none' ? t.none : card.cid}
                          </TableCell>
                          <TableCell className="text-right text-xs">{card.visits}</TableCell>
                          <TableCell className="text-right text-xs">{card.completions}</TableCell>
                          <TableCell className="text-right text-xs">
                            <span style={{ color: conversionColor(card.conversionRate) }}>
                              {card.conversionRate}%
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <ScoreBadge score={card.avgScore} />
                          </TableCell>
                          <TableCell>
                            <TrackPill dev={card.trackDistribution.dev} business={card.trackDistribution.business} />
                          </TableCell>
                          <TableCell className="text-xs">{formatDate(card.firstVisit)}</TableCell>
                          <TableCell className="text-xs">{formatDate(card.lastVisit)}</TableCell>
                          <TableCell />
                        </TableRow>
                      ))}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Flat card performance table */}
          {allCards.filter((c) => c.cid !== 'none').length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t.cardPerformance}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.cid}</TableHead>
                      <TableHead>{t.src}</TableHead>
                      <TableHead className="text-right">{t.visits}</TableHead>
                      <TableHead className="text-right">{t.completions}</TableHead>
                      <TableHead className="text-right">{t.conversionRate}</TableHead>
                      <TableHead className="text-right">{t.avgScore}</TableHead>
                      <TableHead>{t.track}</TableHead>
                      <TableHead>{t.firstVisit}</TableHead>
                      <TableHead>{t.lastVisit}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allCards
                      .filter((c) => c.cid !== 'none')
                      .sort((a, b) => b.visits - a.visits)
                      .map((card) => (
                        <TableRow key={`${card.src}-${card.cid}`}>
                          <TableCell className="font-medium">{card.cid}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{card.src}</TableCell>
                          <TableCell className="text-right">{card.visits}</TableCell>
                          <TableCell className="text-right">{card.completions}</TableCell>
                          <TableCell className="text-right">
                            <span style={{ color: conversionColor(card.conversionRate) }} className="font-semibold">
                              {card.conversionRate}%
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <ScoreBadge score={card.avgScore} />
                          </TableCell>
                          <TableCell>
                            <TrackPill dev={card.trackDistribution.dev} business={card.trackDistribution.business} />
                          </TableCell>
                          <TableCell className="text-xs">{formatDate(card.firstVisit)}</TableCell>
                          <TableCell className="text-xs">{formatDate(card.lastVisit)}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
