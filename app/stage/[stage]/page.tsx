import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SectionCard } from '@/components/SectionCard';
import { getStageContent, isStageKey } from '@/lib/content/stages';

export default async function StagePage({ params }: { params: Promise<{ stage: string }> }) {
  const { stage } = await params;
  if (!isStageKey(stage)) {
    notFound();
  }

  const content = getStageContent(stage);

  return (
    <div className="space-y-6">
      <SectionCard>
        <p className="text-sm uppercase tracking-[0.32em] text-sky-200/80">{content.stage.label}</p>
        <h1 className="mt-2 text-4xl font-semibold text-white">{content.stage.journeyLabel}</h1>
        <p className="mt-3 max-w-3xl text-slate-300">{content.stageSummary}</p>
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-[1.15fr,0.85fr]">
        <SectionCard>
          <h2 className="text-2xl font-semibold text-white">Stage loop</h2>
          <div className="mt-4 grid gap-3 text-sm text-slate-200">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              <strong className="text-white">1. Learn</strong>
              <p className="mt-1">{content.lesson.title}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              <strong className="text-white">2. Quiz</strong>
              <p className="mt-1">{content.quiz.description}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              <strong className="text-white">3. Scenario</strong>
              <p className="mt-1">{content.scenario.description}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              <strong className="text-white">4. Feedback</strong>
              <p className="mt-1">{content.results.nextStep}</p>
            </div>
          </div>
        </SectionCard>
        <SectionCard>
          <h2 className="text-2xl font-semibold text-white">Stage profile</h2>
          <dl className="mt-4 space-y-3 text-sm text-slate-200">
            <div>
              <dt className="text-slate-400">Audience</dt>
              <dd>{content.stage.audience}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Tone</dt>
              <dd>{content.stage.tone}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Objectives</dt>
              <dd>{content.lesson.objectives.length} objectives in this loop</dd>
            </div>
          </dl>
          <Link href={`/lesson/${content.lesson.slug}`} className="mt-6 flex w-full items-center justify-center rounded-full bg-sky-400 px-4 py-3 font-medium text-slate-950 hover:bg-sky-300">
            Start {content.stage.shortLabel} lesson
          </Link>
        </SectionCard>
      </div>
    </div>
  );
}
