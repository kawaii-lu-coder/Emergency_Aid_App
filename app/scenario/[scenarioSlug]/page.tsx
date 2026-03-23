import { notFound } from 'next/navigation';
import { ScenarioView } from '@/components/ScenarioView';
import { getStageForScenario } from '@/lib/content/stages';

export default async function ScenarioPage({ params }: { params: Promise<{ scenarioSlug: string }> }) {
  const { scenarioSlug } = await params;
  const content = getStageForScenario(scenarioSlug);
  if (!content) {
    notFound();
  }

  return <ScenarioView content={content} />;
}
