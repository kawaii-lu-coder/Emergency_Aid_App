import { NextResponse } from 'next/server';
import { isStageKey } from '@/lib/content/stages';
import { saveAttempt } from '@/lib/utils/storage';

export async function POST(request: Request) {
  const body = (await request.json()) as {
    stage?: string;
    learner?: string;
    quizScore?: number;
    quizTotal?: number;
    awarenessScore?: number;
  };

  if (!body.stage || !isStageKey(body.stage)) {
    return NextResponse.json({ error: 'Invalid stage' }, { status: 400 });
  }

  const attempt = saveAttempt({
    id: `quiz-${body.stage}-${Date.now()}`,
    stage: body.stage,
    learner: body.learner || 'Demo learner',
    lessonCompleted: true,
    quizScore: body.quizScore ?? 0,
    quizTotal: body.quizTotal ?? 0,
    awarenessScore: body.awarenessScore ?? 0,
    scenarioSuccess: false,
    readinessScore: 0,
    completedAt: new Date().toISOString(),
  });

  return NextResponse.json({ attempt });
}
