import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { TeamOverview } from '@/components/team/TeamOverview';
import { MemberTable } from '@/components/team/MemberTable';
import { CategoryHeatmap } from '@/components/team/CategoryHeatmap';
import { ShareLinks } from '@/components/team/ShareLinks';
import { TeamWithResponses } from '@/types/survey';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

async function getTeam(teamId: string): Promise<TeamWithResponses | null> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/teams/${teamId}`, {
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function TeamDashboardPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const team = await getTeam(teamId);
  const locale = await getLocale();

  if (!team) {
    notFound();
  }

  const hasResponses = team.responses.length > 0;

  return (
    <div className="px-4 py-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1a1f36]">
            {team.name}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Created by {team.created_by_name}
          </p>
        </div>
        {hasResponses && (
          <Link href={`/api/teams/${teamId}/export`}>
            <Button variant="outline">Export CSV</Button>
          </Link>
        )}
      </div>

      <ShareLinks teamId={teamId} />

      {hasResponses ? (
        <>
          <TeamOverview team={team} locale={locale} />
          <MemberTable responses={team.responses} anonymous={team.anonymous} />
          <CategoryHeatmap
            responses={team.responses}
            track={team.track_preset}
            anonymous={team.anonymous}
            locale={locale}
          />
        </>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">No responses yet.</p>
          <p className="text-sm mt-2">
            Share the survey link with your team to get started.
          </p>
        </div>
      )}
    </div>
  );
}
