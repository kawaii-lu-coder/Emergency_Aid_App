import { AttemptRecord, StageKey } from '@/lib/types/content';

const attemptStore = new Map<StageKey, AttemptRecord[]>();

const seededAttempts: AttemptRecord[] = [
  {
    id: 'seed-1',
    stage: 'primary',
    learner: 'Ava P.',
    lessonCompleted: true,
    quizScore: 3,
    quizTotal: 3,
    awarenessScore: 92,
    scenarioSuccess: true,
    readinessScore: 89,
    completedAt: '2026-03-22T09:15:00.000Z',
  },
  {
    id: 'seed-2',
    stage: 'middle',
    learner: 'Jordan M.',
    lessonCompleted: true,
    quizScore: 3,
    quizTotal: 4,
    awarenessScore: 78,
    scenarioSuccess: true,
    readinessScore: 73,
    completedAt: '2026-03-22T10:30:00.000Z',
  },
  {
    id: 'seed-3',
    stage: 'high',
    learner: 'Taylor H.',
    lessonCompleted: true,
    quizScore: 4,
    quizTotal: 4,
    awarenessScore: 96,
    scenarioSuccess: true,
    readinessScore: 94,
    completedAt: '2026-03-22T11:10:00.000Z',
  },
  {
    id: 'seed-4',
    stage: 'high',
    learner: 'Casey R.',
    lessonCompleted: true,
    quizScore: 2,
    quizTotal: 4,
    awarenessScore: 61,
    scenarioSuccess: false,
    readinessScore: 44,
    completedAt: '2026-03-22T13:45:00.000Z',
  },
  {
    id: 'seed-5',
    stage: 'middle',
    learner: 'Mina L.',
    lessonCompleted: true,
    quizScore: 4,
    quizTotal: 4,
    awarenessScore: 91,
    scenarioSuccess: true,
    readinessScore: 88,
    completedAt: '2026-03-22T15:20:00.000Z',
  },
];

for (const attempt of seededAttempts) {
  const current = attemptStore.get(attempt.stage) ?? [];
  current.push(attempt);
  attemptStore.set(attempt.stage, current);
}

export function listAttempts(stage?: StageKey) {
  if (stage) {
    return [...(attemptStore.get(stage) ?? [])].sort((a, b) => b.completedAt.localeCompare(a.completedAt));
  }

  return [...attemptStore.values()].flat().sort((a, b) => b.completedAt.localeCompare(a.completedAt));
}

export function saveAttempt(attempt: AttemptRecord) {
  const current = attemptStore.get(attempt.stage) ?? [];
  current.unshift(attempt);
  attemptStore.set(attempt.stage, current);
  return attempt;
}

export function completeLesson(stage: StageKey, learner: string) {
  const current = attemptStore.get(stage) ?? [];
  const existing = current.find((attempt) => attempt.learner === learner && !attempt.quizScore && !attempt.readinessScore);
  if (existing) {
    existing.lessonCompleted = true;
    existing.completedAt = new Date().toISOString();
    return existing;
  }

  const attempt: AttemptRecord = {
    id: `lesson-${stage}-${Date.now()}`,
    learner,
    stage,
    lessonCompleted: true,
    quizScore: 0,
    quizTotal: 0,
    awarenessScore: 0,
    scenarioSuccess: false,
    readinessScore: 0,
    completedAt: new Date().toISOString(),
  };
  current.unshift(attempt);
  attemptStore.set(stage, current);
  return attempt;
}
