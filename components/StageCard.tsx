import Link from 'next/link';
import { StageContent } from '@/lib/types/content';
import { SectionCard } from '@/components/SectionCard';

export function StageCard({ content }: { content: StageContent }) {
  return (
    <SectionCard className="flex h-full flex-col justify-between">
      <div className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-sky-200/80">{content.stage.label}</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">{content.stage.journeyLabel}</h3>
        </div>
        <p className="text-sm text-slate-300">{content.stageSummary}</p>
        <ul className="space-y-2 text-sm text-slate-200">
          <li>• Lesson: {content.lesson.title}</li>
          <li>• Quiz: {content.quiz.badgeLabel}</li>
          <li>• Scenario: {content.scenario.title}</li>
        </ul>
      </div>
      <div className="mt-6 flex items-center justify-between text-sm">
        <span className="text-slate-400">Tone: {content.stage.tone}</span>
        <Link href={`/stage/${content.stage.key}`} className="rounded-full bg-sky-400 px-4 py-2 font-medium text-slate-950 hover:bg-sky-300">
          Enter stage
        </Link>
      </div>
    </SectionCard>
  );
}
