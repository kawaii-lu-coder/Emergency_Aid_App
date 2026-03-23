'use client';

import Link from 'next/link';
import { useState } from 'react';
import { StageContent } from '@/lib/types/content';
import { SectionCard } from '@/components/SectionCard';

export function LessonView({ content }: { content: StageContent }) {
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  async function markComplete() {
    setStatus('saving');
    await fetch('/api/lesson-complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage: content.stage.key, learner: 'Demo learner' }),
    });
    setStatus('saved');
  }

  return (
    <div className="space-y-6">
      <SectionCard>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-sky-200/80">{content.stage.label} lesson</p>
            <h1 className="mt-2 text-4xl font-semibold text-white">{content.lesson.title}</h1>
            <p className="mt-3 max-w-3xl text-slate-300">{content.lesson.description}</p>
          </div>
          <div className="rounded-2xl bg-slate-900/70 px-4 py-3 text-sm text-slate-200">
            <div>{content.lesson.estimatedMinutes} min</div>
            <div>{content.lesson.objectives.length} objectives</div>
          </div>
        </div>
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-[1.5fr,0.8fr]">
        <div className="space-y-4">
          {content.lesson.sections.map((section, index) => (
            <SectionCard key={section.title}>
              <p className="text-xs uppercase tracking-[0.28em] text-sky-200/80">Section {index + 1}</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">{section.title}</h2>
              <p className="mt-3 text-slate-300">{section.body}</p>
              {section.bullets ? (
                <ul className="mt-4 space-y-2 text-sm text-slate-200">
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>• {bullet}</li>
                  ))}
                </ul>
              ) : null}
            </SectionCard>
          ))}
        </div>
        <div className="space-y-4">
          <SectionCard>
            <h3 className="text-xl font-semibold text-white">Learning objectives</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-200">
              {content.lesson.objectives.map((objective) => (
                <li key={objective}>• {objective}</li>
              ))}
            </ul>
          </SectionCard>
          <SectionCard>
            <h3 className="text-xl font-semibold text-white">Key takeaway</h3>
            <p className="mt-3 text-slate-300">{content.lesson.takeaway}</p>
          </SectionCard>
          <SectionCard>
            <button
              onClick={markComplete}
              className="w-full rounded-full bg-mint px-4 py-3 font-medium text-slate-950 hover:bg-emerald-300"
            >
              {status === 'saved' ? 'Lesson marked complete' : status === 'saving' ? 'Saving...' : 'Mark lesson complete'}
            </button>
            <Link
              href={`/quiz/${content.quiz.slug}`}
              className="mt-3 flex w-full items-center justify-center rounded-full border border-sky-300/40 px-4 py-3 text-sm font-medium text-sky-100 hover:bg-sky-400/10"
            >
              Continue to quiz
            </Link>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
