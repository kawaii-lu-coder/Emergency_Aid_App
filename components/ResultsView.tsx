import Link from 'next/link';
import { StageContent } from '@/lib/types/content';
import { listAttempts } from '@/lib/utils/storage';
import { SectionCard } from '@/components/SectionCard';

function getBand(content: StageContent, score: number) {
  return content.results.awarenessBands.find((band) => score >= band.min) ?? content.results.awarenessBands.at(-1)!;
}

export function ResultsView({ content }: { content: StageContent }) {
  const latest = listAttempts(content.stage.key).find((attempt) => attempt.learner === 'Demo learner') ?? listAttempts(content.stage.key)[0];
  const band = getBand(content, latest?.awarenessScore ?? 0);

  return (
    <div className="space-y-6">
      <SectionCard>
        <p className="text-sm uppercase tracking-[0.3em] text-sky-200/80">{content.stage.label} results</p>
        <h1 className="mt-2 text-4xl font-semibold text-white">{content.results.headline}</h1>
        <p className="mt-3 max-w-3xl text-slate-300">{content.results.encouragement}</p>
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard>
          <p className="text-sm text-slate-400">Lesson completion</p>
          <div className="mt-2 text-4xl font-semibold text-white">{latest?.lessonCompleted ? 'Done' : 'Pending'}</div>
        </SectionCard>
        <SectionCard>
          <p className="text-sm text-slate-400">Quiz score</p>
          <div className="mt-2 text-4xl font-semibold text-white">{latest ? `${latest.quizScore}/${latest.quizTotal}` : '—'}</div>
        </SectionCard>
        <SectionCard>
          <p className="text-sm text-slate-400">Scenario readiness</p>
          <div className="mt-2 text-4xl font-semibold text-white">{latest?.readinessScore ?? 0}</div>
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.25fr,0.75fr]">
        <SectionCard>
          <h2 className="text-2xl font-semibold text-white">Performance band: {band.label}</h2>
          <p className="mt-3 text-slate-300">{band.description}</p>
          <p className="mt-6 text-sm text-slate-400">{content.results.nextStep}</p>
        </SectionCard>
        <SectionCard>
          <h3 className="text-xl font-semibold text-white">Next moves</h3>
          <div className="mt-4 flex flex-col gap-3">
            <Link href={`/lesson/${content.lesson.slug}`} className="rounded-full border border-white/15 px-4 py-3 text-center text-sm text-white hover:bg-white/5">
              Review lesson
            </Link>
            <Link href={`/quiz/${content.quiz.slug}`} className="rounded-full border border-white/15 px-4 py-3 text-center text-sm text-white hover:bg-white/5">
              Retry quiz
            </Link>
            <Link href={`/teacher`} className="rounded-full bg-sky-400 px-4 py-3 text-center text-sm font-medium text-slate-950 hover:bg-sky-300">
              See teacher dashboard
            </Link>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
