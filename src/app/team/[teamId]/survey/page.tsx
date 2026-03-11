'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SurveyForm } from '@/components/survey/SurveyForm';
import type { Track, Team } from '@/types/survey';

export default function TeamSurveyPage() {
  const params = useParams<{ teamId: string }>();
  const teamId = params.teamId;

  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchTeam() {
      try {
        const res = await fetch(`/api/teams/${teamId}`);
        if (!res.ok) throw new Error('Failed to fetch team');
        const data = await res.json();
        setTeam(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchTeam();
  }, [teamId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="flex items-center justify-center py-20 text-destructive">
        Team not found
      </div>
    );
  }

  const defaultTrack: Track | undefined =
    team.track_preset === 'dev' || team.track_preset === 'business'
      ? team.track_preset
      : undefined;

  return <SurveyForm defaultTrack={defaultTrack} teamId={teamId} />;
}
