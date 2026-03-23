import { highStageContent } from '@/lib/content/stage-data/high';
import { middleStageContent } from '@/lib/content/stage-data/middle';
import { primaryStageContent } from '@/lib/content/stage-data/primary';
import { StageContent, StageKey } from '@/lib/types/content';

export const stageContentMap: Record<StageKey, StageContent> = {
  primary: primaryStageContent,
  middle: middleStageContent,
  high: highStageContent,
};

export const allStages = Object.values(stageContentMap);

export function isStageKey(value: string): value is StageKey {
  return value === 'primary' || value === 'middle' || value === 'high';
}

export function getStageContent(stage: StageKey): StageContent {
  return stageContentMap[stage];
}

export function getStageBySlug(slug: string): StageContent | undefined {
  return allStages.find((entry) =>
    [entry.stage.key, entry.lesson.slug, entry.quiz.slug, entry.scenario.slug].includes(slug as StageKey),
  );
}

export function getStageForLesson(lessonSlug: string): StageContent | undefined {
  return allStages.find((entry) => entry.lesson.slug === lessonSlug);
}

export function getStageForQuiz(quizSlug: string): StageContent | undefined {
  return allStages.find((entry) => entry.quiz.slug === quizSlug);
}

export function getStageForScenario(scenarioSlug: string): StageContent | undefined {
  return allStages.find((entry) => entry.scenario.slug === scenarioSlug);
}
