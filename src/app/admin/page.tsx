'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SurveyResponse, Team, getScoreLabel } from '@/types/survey';

interface AdminStats {
  totalResponses: number;
  totalTeams: number;
  avgScore: number;
  trackDistribution: { dev: number; business: number };
  avgTimelineGap: number;
  avgTimelinePosition: string | null;
  directionCounts: { widening: number; stable: number; closing: number };
  pctWidening: number;
}

export default function AdminPage() {
  const t = useTranslations('admin');
  const tc = useTranslations('common');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, responsesRes, teamsRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/responses'),
          fetch('/api/teams'),
        ]);
        const [statsData, responsesData, teamsData] = await Promise.all([
          statsRes.json(),
          responsesRes.json(),
          teamsRes.json(),
        ]);
        setStats(statsData);
        setResponses(responsesData);
        setTeams(teamsData);
      } catch (err) {
        console.error('Failed to load admin data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Build team name lookup
  const teamNameMap = new Map<string, string>();
  teams.forEach((team) => teamNameMap.set(team.id, team.name));

  // Calculate team member counts and avg scores
  const teamStats = teams.map((team) => {
    const teamResponses = responses.filter((r) => r.team_id === team.id);
    const memberCount = teamResponses.length;
    const avgScore = memberCount > 0
      ? Math.round(teamResponses.reduce((s, r) => s + r.scores.overall, 0) / memberCount)
      : 0;
    return { ...team, memberCount, avgScore };
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        {tc('loading')}
      </div>
    );
  }

  return (
    <div className="px-4 py-8 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold text-[#121212]">{t('title')}</h1>

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                {t('totalResponses')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalResponses}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Dev: {stats.trackDistribution.dev} / Business: {stats.trackDistribution.business}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                {t('totalTeams')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalTeams}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                {t('avgScore')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" style={{ color: getScoreLabel(stats.avgScore).color }}>
                {stats.avgScore}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                {t('avgTimelineGap')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.avgTimelineGap}<span className="text-lg font-normal text-muted-foreground ml-1">mo</span></div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.pctWidening}% {t('wideningGap')}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* All Responses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {t('responses')}
            {responses.length > 0 && (
              <Link href="/api/responses/export">
                <Button variant="outline" size="sm">{tc('export')}</Button>
              </Link>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {responses.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">
              No responses yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('name')}</TableHead>
                  <TableHead>{t('score')}</TableHead>
                  <TableHead>{t('timelinePosition')}</TableHead>
                  <TableHead>{t('gapMonths')}</TableHead>
                  <TableHead>{t('track')}</TableHead>
                  <TableHead>{t('team')}</TableHead>
                  <TableHead>{t('date')}</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {responses.map((response) => {
                  const scoreLabel = getScoreLabel(response.scores.overall);
                  const timelineLabel = response.scores.timeline?.timelinePositionLabel ?? '-';
                  const gapMonths = response.scores.timeline?.gapMonths;

                  return (
                    <TableRow key={response.id}>
                      <TableCell>
                        {response.respondent_name || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge style={{ backgroundColor: scoreLabel.color, color: '#fff' }}>
                          {response.scores.overall}
                        </Badge>
                      </TableCell>
                      <TableCell>{timelineLabel}</TableCell>
                      <TableCell>
                        {gapMonths !== undefined ? (
                          <span className={gapMonths > 18 ? 'text-red-600 font-medium' : gapMonths > 12 ? 'text-orange-500 font-medium' : ''}>
                            {gapMonths}
                          </span>
                        ) : '-'}
                      </TableCell>
                      <TableCell className="capitalize">{response.track}</TableCell>
                      <TableCell>
                        {response.team_id ? (
                          <Link
                            href={`/team/${response.team_id}`}
                            className="text-[#FFAB54] hover:underline font-medium"
                          >
                            {teamNameMap.get(response.team_id) || response.team_id}
                          </Link>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(response.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Link href={`/survey/${response.id}/results`}>
                          <Button variant="ghost" size="sm">
                            {t('viewResults')}
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* All Teams */}
      <Card>
        <CardHeader>
          <CardTitle>{t('teams')}</CardTitle>
        </CardHeader>
        <CardContent>
          {teamStats.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">
              No teams yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('name')}</TableHead>
                  <TableHead>{t('members')}</TableHead>
                  <TableHead>{t('score')}</TableHead>
                  <TableHead>{t('date')}</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamStats.map((team) => {
                  const scoreLabel = team.avgScore > 0 ? getScoreLabel(team.avgScore) : null;
                  return (
                    <TableRow key={team.id}>
                      <TableCell className="font-medium">{team.name}</TableCell>
                      <TableCell>{team.memberCount}</TableCell>
                      <TableCell>
                        {scoreLabel ? (
                          <Badge style={{ backgroundColor: scoreLabel.color, color: '#fff' }}>
                            {team.avgScore}
                          </Badge>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(team.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Link href={`/team/${team.id}`}>
                          <Button variant="ghost" size="sm">
                            {t('viewTeam')}
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
