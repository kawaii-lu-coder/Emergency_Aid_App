import { notFound } from 'next/navigation';
import { ResultsView } from '@/components/ResultsView';
import { getStageContent, isStageKey } from '@/lib/content/stages';

export default async function ResultsPage({ params }: { params: Promise<{ stage: string }> }) {
  const { stage } = await params;
  if (!isStageKey(stage)) {
    notFound();
  }

  return <ResultsView content={getStageContent(stage)} />;
}
