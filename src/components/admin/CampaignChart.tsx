'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface CampaignGroup {
  src: string;
  visits: number;
  completions: number;
}

interface CampaignChartProps {
  groups: CampaignGroup[];
  visitLabel?: string;
  completionLabel?: string;
}

export function CampaignChart({
  groups,
  visitLabel = 'Visits',
  completionLabel = 'Completions',
}: CampaignChartProps) {
  const data = groups.map((g) => ({
    name: g.src,
    visits: g.visits,
    completions: g.completions,
  }));

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="visits" name={visitLabel} fill="#FFAB54" />
        <Bar dataKey="completions" name={completionLabel} fill="#121212" />
      </BarChart>
    </ResponsiveContainer>
  );
}
