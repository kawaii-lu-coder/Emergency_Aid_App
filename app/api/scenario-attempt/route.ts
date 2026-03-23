import { NextResponse } from 'next/server';
import { isStageKey } from '@/lib/content/stages';
import { listAttempts, saveAttempt } from '@/lib/utils/storage';

export async function POST(request: Request) {
  const body = (await request.json()) as {
    stage?: string;
    learner?: string;
    scenarioSuccess?: boolean;
    readinessScore?: number;
  };

  if (!body.stage || !isStageKey(body.stage)) {
    return NextResponse.json({ error: 'Invalid stage' }, { status: 400 });
  }

  const existing = listAttempts(body.stage).find((attempt) => attempt.learner === (body.learner || 'Demo learner'));

  const attempt = saveAttempt({
    id: `scenario-${body.stage}-${Date.now()}`,
    stage: body.stage,
    learner: body.learner || 'Demo learner',
    lessonCompleted: existing?.lessonCompleted ?? true,
    quizScore: existing?.quizScore ?? 0,
    quizTotal: existing?.quizTotal ?? 0,
    awarenessScore: existing?.awarenessScore ?? 0,
    scenarioSuccess: body.scenarioSuccess ?? false,
    readinessScore: body.readinessScore ?? 0,
    completedAt: new Date().toISOString(),
  });

  return NextResponse.json({ attempt });
}
