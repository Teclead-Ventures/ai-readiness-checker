import { createServerClient } from '@/lib/supabase/server';
import { getLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { SurveyResponse } from '@/types/survey';
import { ResultsContent } from './ResultsContent';

interface PageProps {
  params: Promise<{ responseId: string }>;
}

export default async function ResultsPage({ params }: PageProps) {
  const { responseId } = await params;
  const locale = await getLocale();

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('responses')
    .select('*')
    .eq('id', responseId)
    .single();

  if (error || !data) {
    notFound();
  }

  const response = data as SurveyResponse;

  return <ResultsContent response={response} locale={locale} />;
}
