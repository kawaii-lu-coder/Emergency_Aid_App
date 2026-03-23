export type StageKey = 'primary' | 'middle' | 'high';

export type StageMeta = {
  key: StageKey;
  label: string;
  shortLabel: string;
  audience: string;
  tone: string;
  theme: string;
  journeyLabel: string;
  lessonSlug: string;
  quizSlug: string;
  scenarioSlug: string;
};

export type LessonSection = {
  title: string;
  body: string;
  bullets?: string[];
};

export type LessonDefinition = {
  slug: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  objectives: string[];
  sections: LessonSection[];
  takeaway: string;
};

export type QuizOption = {
  id: string;
  label: string;
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation: string;
  competency: 'awareness' | 'safety' | 'sequence' | 'help-seeking';
};

export type QuizDefinition = {
  slug: string;
  title: string;
  description: string;
  badgeLabel: string;
  questions: QuizQuestion[];
};

export type ScenarioChoice = {
  id: string;
  label: string;
  next: string;
  effect: 'positive' | 'neutral' | 'negative';
  rationale: string;
};

export type ScenarioNode = {
  id: string;
  title: string;
  narrative: string;
  choices?: ScenarioChoice[];
  terminal?: boolean;
  outcome?: {
    heading: string;
    summary: string;
    success: boolean;
    readinessDelta: number;
  };
};

export type ScenarioDefinition = {
  slug: string;
  title: string;
  description: string;
  startNodeId: string;
  nodes: ScenarioNode[];
};

export type ResultCopy = {
  headline: string;
  encouragement: string;
  nextStep: string;
  awarenessBands: { min: number; label: string; description: string }[];
};

export type StageContent = {
  stage: StageMeta;
  stageSummary: string;
  lesson: LessonDefinition;
  quiz: QuizDefinition;
  scenario: ScenarioDefinition;
  results: ResultCopy;
};

export type AttemptRecord = {
  id: string;
  stage: StageKey;
  learner: string;
  lessonCompleted: boolean;
  quizScore: number;
  quizTotal: number;
  awarenessScore: number;
  scenarioSuccess: boolean;
  readinessScore: number;
  completedAt: string;
};
