'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { createActor } from 'xstate';
import { StageContent } from '@/lib/types/content';
import { createScenarioMachine } from '@/lib/state/scenarioMachine';
import { SectionCard } from '@/components/SectionCard';

export function ScenarioView({ content }: { content: StageContent }) {
  const machine = useMemo(() => createScenarioMachine(content.scenario), [content.scenario]);
  const [actor] = useState(() => createActor(machine).start());
  const [snapshot, setSnapshot] = useState(actor.getSnapshot());
  const nodeMap = useMemo(() => Object.fromEntries(content.scenario.nodes.map((node) => [node.id, node])), [content.scenario.nodes]);
  const currentNode = nodeMap[snapshot.context.currentNodeId];

  const persistResult = async () => {
    if (!currentNode.terminal || !currentNode.outcome) {
      return;
    }

    await fetch('/api/scenario-attempt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stage: content.stage.key,
        learner: 'Demo learner',
        scenarioSuccess: currentNode.outcome.success,
        readinessScore: Math.max(0, Math.min(100, snapshot.context.readinessScore + currentNode.outcome.readinessDelta)),
      }),
    });
  };

  return (
    <div className="space-y-6">
      <SectionCard>
        <p className="text-sm uppercase tracking-[0.3em] text-sky-200/80">{content.stage.label} scenario</p>
        <h1 className="mt-2 text-4xl font-semibold text-white">{content.scenario.title}</h1>
        <p className="mt-3 max-w-3xl text-slate-300">{content.scenario.description}</p>
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-[1.35fr,0.75fr]">
        <SectionCard>
          <p className="text-xs uppercase tracking-[0.28em] text-sky-200/80">Current situation</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{currentNode.title}</h2>
          <p className="mt-3 text-slate-300">{currentNode.narrative}</p>

          {currentNode.terminal && currentNode.outcome ? (
            <div className={`mt-6 rounded-3xl border px-5 py-5 ${currentNode.outcome.success ? 'border-emerald-300/30 bg-emerald-400/10' : 'border-amber-300/30 bg-amber-400/10'}`}>
              <h3 className="text-xl font-semibold text-white">{currentNode.outcome.heading}</h3>
              <p className="mt-2 text-sm text-slate-200">{currentNode.outcome.summary}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  onClick={async () => {
                    await persistResult();
                  }}
                  className="rounded-full bg-sky-400 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-sky-300"
                >
                  Save scenario result
                </button>
                <Link href={`/results/${content.stage.key}`} className="rounded-full border border-white/15 px-4 py-2 text-sm text-white hover:bg-white/5">
                  View result page
                </Link>
                <button
                  onClick={() => {
                    actor.send({ type: 'RESET' });
                    setSnapshot(actor.getSnapshot());
                  }}
                  className="rounded-full border border-white/15 px-4 py-2 text-sm text-white hover:bg-white/5"
                >
                  Replay scenario
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-6 grid gap-3">
              {currentNode.choices?.map((choice) => (
                <button
                  key={choice.id}
                  onClick={() => {
                    actor.send({ type: 'CHOOSE', choiceId: choice.id });
                    setSnapshot(actor.getSnapshot());
                  }}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-left hover:border-sky-300/40 hover:bg-sky-300/10"
                >
                  <div className="font-medium text-white">{choice.label}</div>
                  <div className="mt-1 text-sm text-slate-300">{choice.rationale}</div>
                </button>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard>
          <h3 className="text-xl font-semibold text-white">Simulation pulse</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-200">
            <div className="flex justify-between gap-4">
              <span>Current node</span>
              <span>{snapshot.context.currentNodeId}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Readiness</span>
              <span>{snapshot.context.readinessScore}</span>
            </div>
            <div>
              <span className="text-slate-400">Decision path</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {snapshot.context.path.map((entry, index) => (
                  <span key={`${entry}-${index}`} className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">
                    {entry}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
