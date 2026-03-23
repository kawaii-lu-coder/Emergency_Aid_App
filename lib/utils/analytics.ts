import { allStages } from '@/lib/content/stages';
import { AttemptRecord, StageKey } from '@/lib/types/content';

export type StageSummary = {
  stage: StageKey;
  stageLabel: string;
  attempts: number;
  completions: number;
  completionRate: number;
  averageQuizScore: number;
  averageQuizPercent: number;
  scenarioSuccessRate: number;
  averageAwareness: number;
  averageReadiness: number;
};

export function summarizeAttempts(attempts: AttemptRecord[]): StageSummary[] {
  return allStages.map((stageEntry) => {
    const stageAttempts = attempts.filter((attempt) => attempt.stage === stageEntry.stage.key);
    const attemptsCount = stageAttempts.length;
    const completions = stageAttempts.filter((attempt) => attempt.lessonCompleted).length;
    const quizTotals = stageAttempts.reduce(
      (acc, attempt) => {
        acc.score += attempt.quizScore;
        acc.total += attempt.quizTotal;
        acc.awareness += attempt.awarenessScore;
        acc.readiness += attempt.readinessScore;
        acc.success += Number(attempt.scenarioSuccess);
        return acc;
      },
      { score: 0, total: 0, awareness: 0, readiness: 0, success: 0 },
    );

    return {
      stage: stageEntry.stage.key,
      stageLabel: stageEntry.stage.shortLabel,
      attempts: attemptsCount,
      completions,
      completionRate: attemptsCount ? Math.round((completions / attemptsCount) * 100) : 0,
      averageQuizScore: attemptsCount ? Number((quizTotals.score / attemptsCount).toFixed(1)) : 0,
      averageQuizPercent: quizTotals.total ? Math.round((quizTotals.score / quizTotals.total) * 100) : 0,
      scenarioSuccessRate: attemptsCount ? Math.round((quizTotals.success / attemptsCount) * 100) : 0,
      averageAwareness: attemptsCount ? Math.round(quizTotals.awareness / attemptsCount) : 0,
      averageReadiness: attemptsCount ? Math.round(quizTotals.readiness / attemptsCount) : 0,
    };
  });
}

export function overallMetrics(attempts: AttemptRecord[]) {
  const totalAttempts = attempts.length;
  const totalCompleted = attempts.filter((attempt) => attempt.lessonCompleted).length;
  const averageReadiness = totalAttempts
    ? Math.round(attempts.reduce((sum, attempt) => sum + attempt.readinessScore, 0) / totalAttempts)
    : 0;

  return {
    totalAttempts,
    totalCompleted,
    averageReadiness,
  };
}

export function questionAccuracyByStage() {
  return [
    { skill: 'Scene safety', primary: 88, middle: 82, high: 91 },
    { skill: 'Help-seeking', primary: 92, middle: 85, high: 90 },
    { skill: 'Response sequence', primary: 74, middle: 79, high: 87 },
    { skill: 'Calm coordination', primary: 80, middle: 77, high: 86 },
  ];
}
