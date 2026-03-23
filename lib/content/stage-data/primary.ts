import { StageContent } from '@/lib/types/content';

export const primaryStageContent: StageContent = {
  stage: {
    key: 'primary',
    label: 'Primary School',
    shortLabel: 'Primary',
    audience: 'Younger learners who need simple, guided safety habits.',
    tone: 'Friendly, visual, reassuring',
    theme: 'sky',
    journeyLabel: 'Spot danger, get help, stay calm',
    lessonSlug: 'primary-safe-response',
    quizSlug: 'primary-safe-response-quiz',
    scenarioSlug: 'primary-playground-help',
  },
  stageSummary: 'A gentle introduction that teaches children to notice danger, call a trusted adult, and avoid unsafe actions.',
  lesson: {
    slug: 'primary-safe-response',
    title: 'If someone feels faint: stay safe and find help',
    description: 'A short lesson that teaches children what to notice and what safe actions they can take when someone nearby feels unwell.',
    estimatedMinutes: 4,
    objectives: [
      'Notice when a situation may be unsafe.',
      'Know which adult or emergency contact to find.',
      'Remember not to move a person unless told by an adult helper.',
    ],
    sections: [
      {
        title: '1. Look before you help',
        body: 'First, check if the area is safe for you too. If there are stairs, traffic, or sharp objects nearby, do not rush in.',
        bullets: ['Stay calm.', 'Look for danger.', 'Keep yourself safe.'],
      },
      {
        title: '2. Find a trusted adult quickly',
        body: 'If a student suddenly feels weak, dizzy, or falls down, tell a teacher, school nurse, or another trusted adult right away.',
        bullets: ['Use a loud clear voice.', 'Point to where the person is.', 'Stay nearby if it is safe.'],
      },
      {
        title: '3. Be a safe helper',
        body: 'Do not give food or water. Do not try to lift the person. Stay nearby, make space, and wait for adult instructions.',
      },
    ],
    takeaway: 'A safe helper looks, calls for an adult, and stays calm.',
  },
  quiz: {
    slug: 'primary-safe-response-quiz',
    title: 'Safety Star Quiz',
    description: 'Quick questions to practice safe helper choices.',
    badgeLabel: 'Safety Star',
    questions: [
      {
        id: 'p1',
        prompt: 'What should you do first if you see someone fall on the playground?',
        options: [
          { id: 'a', label: 'Check if the area is safe' },
          { id: 'b', label: 'Run away without telling anyone' },
          { id: 'c', label: 'Give them a snack' },
        ],
        correctOptionId: 'a',
        explanation: 'The first safe action is to look for danger before helping.',
        competency: 'safety',
      },
      {
        id: 'p2',
        prompt: 'Who should you tell right away?',
        options: [
          { id: 'a', label: 'A teacher or school nurse' },
          { id: 'b', label: 'Only your best friend' },
          { id: 'c', label: 'No one' },
        ],
        correctOptionId: 'a',
        explanation: 'A trusted adult can take the right next step quickly.',
        competency: 'help-seeking',
      },
      {
        id: 'p3',
        prompt: 'What is a safe helper action?',
        options: [
          { id: 'a', label: 'Lift the person up by yourself' },
          { id: 'b', label: 'Keep space and wait for adult help' },
          { id: 'c', label: 'Pour water into their mouth' },
        ],
        correctOptionId: 'b',
        explanation: 'Children should keep the area clear and wait for adult instructions.',
        competency: 'awareness',
      },
    ],
  },
  scenario: {
    slug: 'primary-playground-help',
    title: 'Playground Helper Mission',
    description: 'Choose what to do when a classmate looks dizzy near the slide.',
    startNodeId: 'start',
    nodes: [
      {
        id: 'start',
        title: 'A classmate sits down suddenly',
        narrative: 'During recess, a classmate says they feel dizzy and slides down beside the play area.',
        choices: [
          { id: 'look', label: 'Look around for danger first', next: 'adult', effect: 'positive', rationale: 'You make sure the area is safe before acting.' },
          { id: 'pull', label: 'Pull them to their feet fast', next: 'unsafe', effect: 'negative', rationale: 'Moving someone quickly can make the situation worse.' },
        ],
      },
      {
        id: 'adult',
        title: 'You stay calm',
        narrative: 'The area is clear. Your classmate still looks pale and weak.',
        choices: [
          { id: 'teacher', label: 'Call a teacher over loudly', next: 'space', effect: 'positive', rationale: 'An adult can take charge quickly.' },
          { id: 'water', label: 'Give them your drink bottle', next: 'unsafe', effect: 'negative', rationale: 'Food or drink should not be given unless an adult says so.' },
        ],
      },
      {
        id: 'space',
        title: 'Help is arriving',
        narrative: 'A teacher comes over. Other students are crowding around.',
        choices: [
          { id: 'clear', label: 'Ask others to make space', next: 'good-end', effect: 'positive', rationale: 'Making space helps the adult helper work safely.' },
          { id: 'panic', label: 'Start yelling that something terrible happened', next: 'mixed-end', effect: 'neutral', rationale: 'Panic can make the scene harder to manage.' },
        ],
      },
      {
        id: 'good-end',
        title: 'Safe helper ending',
        narrative: 'The teacher thanks you for staying calm and helping safely.',
        terminal: true,
        outcome: {
          heading: 'Great safe-helper choices',
          summary: 'You checked for danger, got an adult, and kept the area clear.',
          success: true,
          readinessDelta: 25,
        },
      },
      {
        id: 'mixed-end',
        title: 'Almost there',
        narrative: 'The teacher takes over, but the crowd was harder to control because people got nervous.',
        terminal: true,
        outcome: {
          heading: 'Good instincts, calmer actions next time',
          summary: 'You got help, but calm communication would improve the response.',
          success: true,
          readinessDelta: 12,
        },
      },
      {
        id: 'unsafe',
        title: 'Unsafe ending',
        narrative: 'The adult helper explains that moving the student or giving a drink was not the safest choice.',
        terminal: true,
        outcome: {
          heading: 'Pause and remember the safe steps',
          summary: 'Look first, tell an adult, and avoid moving the person unless directed.',
          success: false,
          readinessDelta: 4,
        },
      },
    ],
  },
  results: {
    headline: 'Primary helper feedback',
    encouragement: 'Safe helpers do not have to do everything. They notice, stay calm, and get a trusted adult.',
    nextStep: 'Repeat the loop and try to earn a stronger readiness score.',
    awarenessBands: [
      { min: 85, label: 'Ready safety star', description: 'You consistently notice danger and seek help quickly.' },
      { min: 60, label: 'Growing helper', description: 'You know the main safety steps and need a little more confidence.' },
      { min: 0, label: 'Practice needed', description: 'Review the lesson and try the scenario again with calmer choices.' },
    ],
  },
};
