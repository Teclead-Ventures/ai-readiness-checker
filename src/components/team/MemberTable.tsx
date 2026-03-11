'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SurveyResponse, getScoreLabel } from '@/types/survey';

interface MemberTableProps {
  responses: SurveyResponse[];
  anonymous: boolean;
}

export function MemberTable({ responses, anonymous }: MemberTableProps) {
  const t = useTranslations('team.dashboard');

  const sorted = [...responses].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('members')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('member')}</TableHead>
              <TableHead>{t('score')}</TableHead>
              <TableHead>{t('track')}</TableHead>
              <TableHead>{t('date')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((response, index) => {
              const scoreLabel = getScoreLabel(response.scores.overall);
              const displayName = anonymous
                ? `${t('anonymous')} #${sorted.length - index}`
                : response.respondent_name || `${t('anonymous')} #${sorted.length - index}`;

              return (
                <TableRow key={response.id}>
                  <TableCell>
                    <Link
                      href={`/survey/${response.id}/results`}
                      className="text-blue-600 hover:underline"
                    >
                      {displayName}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge
                      style={{ backgroundColor: scoreLabel.color, color: '#fff' }}
                    >
                      {response.scores.overall}
                    </Badge>
                  </TableCell>
                  <TableCell className="capitalize">{response.track}</TableCell>
                  <TableCell>
                    {new Date(response.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
