'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { StageContent } from '@/lib/types/content';
import { SectionCard } from '@/components/SectionCard';

export function QuizView({ content }: { content: StageContent }) {
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const total = content.quiz.questions.length;

  const score = useMemo(
    () =>
      content.quiz.questions.reduce((sum, question) => sum + Number(selected[question.id] === question.correctOptionId), 0),
    [content.quiz.questions, selected],
  );

  const awarenessScore = Math.round((score / total) * 100);

  async function submitQuiz() {
    setSubmitted(true);
    await fetch('/api/quiz-attempt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stage: content.stage.key,
        learner: 'Demo learner',
        quizScore: score,
        quizTotal: total,
        awarenessScore,
      }),
    });
  }

  return (
    <div className="space-y-6">
      <SectionCard>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-sky-200/80">{content.stage.label} quiz</p>
            <h1 className="mt-2 text-4xl font-semibold text-white">{content.quiz.title}</h1>
            <p className="mt-3 max-w-3xl text-slate-300">{content.quiz.description}</p>
          </div>
          <div className="rounded-full border border-yellow-300/40 bg-yellow-300/10 px-4 py-2 text-sm text-yellow-100">
            Badge: {content.quiz.badgeLabel}
          </div>
        </div>
      </SectionCard>

      <div className="space-y-4">
        {content.quiz.questions.map((question, index) => {
          const selectedOption = selected[question.id];
          const answeredCorrectly = selectedOption === question.correctOptionId;
          return (
            <SectionCard key={question.id}>
              <p className="text-xs uppercase tracking-[0.28em] text-sky-200/80">
                Question {index + 1} · {question.competency}
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white">{question.prompt}</h2>
              <div className="mt-4 grid gap-3">
                {question.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSelected((current) => ({ ...current, [question.id]: option.id }))}
                    className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                      selectedOption === option.id
                        ? 'border-sky-300 bg-sky-300/10 text-white'
                        : 'border-white/10 bg-white/5 text-slate-200 hover:border-slate-300/40'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {submitted ? (
                <div className={`mt-4 rounded-2xl px-4 py-3 text-sm ${answeredCorrectly ? 'bg-emerald-400/15 text-emerald-100' : 'bg-amber-400/15 text-amber-100'}`}>
                  {question.explanation}
                </div>
              ) : null}
            </SectionCard>
          );
        })}
      </div>

      <SectionCard>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-300">Score preview: {score}/{total}</p>
            <p className="text-sm text-slate-400">Awareness score: {awarenessScore}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={submitQuiz}
              className="rounded-full bg-sky-400 px-5 py-3 font-medium text-slate-950 hover:bg-sky-300"
            >
              Submit quiz
            </button>
            <Link href={`/scenario/${content.scenario.slug}`} className="rounded-full border border-white/15 px-5 py-3 text-sm text-white hover:bg-white/5">
              Continue to scenario
            </Link>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
