import { StageContent } from '@/lib/types/content';

export const middleStageContent: StageContent = {
  stage: {
    key: 'middle',
    label: 'Middle School',
    shortLabel: 'Middle',
    audience: 'Learners ready for more responsibility and clearer decision sequencing.',
    tone: 'Direct, supportive, practical',
    theme: 'mint',
    journeyLabel: 'Assess, alert, assist responsibly',
    lessonSlug: 'middle-campus-response',
    quizSlug: 'middle-campus-response-quiz',
    scenarioSlug: 'middle-hallway-response',
  },
  stageSummary: 'A structured loop for students who can evaluate the scene, alert the right adult support, and make better sequence decisions.',
  lesson: {
    slug: 'middle-campus-response',
    title: 'Responding when someone becomes faint at school',
    description: 'A practical guide to scene safety, fast adult alerting, and supporting the response without taking unsafe actions.',
    estimatedMinutes: 5,
    objectives: [
      'Check scene safety before acting.',
      'Decide who to alert and what information to share.',
      'Support the response by keeping the area organized.',
    ],
    sections: [
      {
        title: '1. Start with safety and awareness',
        body: 'Notice what happened, where it happened, and whether there are any hazards nearby such as stairs, sports equipment, or crowded movement.',
      },
      {
        title: '2. Alert the right support fast',
        body: 'Contact a teacher, school nurse, or campus emergency contact and clearly describe the location and what you observed.',
        bullets: ['Where is the person?', 'Are they responsive?', 'Is the area crowded or risky?'],
      },
      {
        title: '3. Support without overstepping',
        body: 'Middle school students can help by making space, staying calm, and relaying information. They should not improvise medical actions.',
      },
    ],
    takeaway: 'A strong responder notices the scene, communicates clearly, and supports adult-led care.',
  },
  quiz: {
    slug: 'middle-campus-response-quiz',
    title: 'Campus Response Challenge',
    description: 'Test your sequence and judgment.',
    badgeLabel: 'Response Ranger',
    questions: [
      {
        id: 'm1',
        prompt: 'A student feels faint in a crowded hallway. What is your best first step?',
        options: [
          { id: 'a', label: 'Assess safety and responsiveness' },
          { id: 'b', label: 'Move them immediately no matter what' },
          { id: 'c', label: 'Ignore it and keep walking' },
        ],
        correctOptionId: 'a',
        explanation: 'You need a quick scene check before deciding what support is safe.',
        competency: 'safety',
      },
      {
        id: 'm2',
        prompt: 'Which message is most useful to give an adult helper?',
        options: [
          { id: 'a', label: 'Someone is down by the science wing and looks pale and dizzy' },
          { id: 'b', label: 'Come fast!' },
          { id: 'c', label: 'I do not know what happened but maybe it is fine' },
        ],
        correctOptionId: 'a',
        explanation: 'Specific location and visible condition help adults respond faster.',
        competency: 'help-seeking',
      },
      {
        id: 'm3',
        prompt: 'What is the best way to help while waiting for an adult?',
        options: [
          { id: 'a', label: 'Make space and keep the area calm' },
          { id: 'b', label: 'Film the situation to explain it later' },
          { id: 'c', label: 'Ask everyone to crowd in and watch' },
        ],
        correctOptionId: 'a',
        explanation: 'Keeping the area calm and clear supports a safer response.',
        competency: 'sequence',
      },
      {
        id: 'm4',
        prompt: 'Why should you avoid making up first-aid steps on your own?',
        options: [
          { id: 'a', label: 'Because the wrong action can create more risk' },
          { id: 'b', label: 'Because helping is never useful' },
          { id: 'c', label: 'Because only friends can help' },
        ],
        correctOptionId: 'a',
        explanation: 'Safe support means staying within what you are trained and expected to do.',
        competency: 'awareness',
      },
    ],
  },
  scenario: {
    slug: 'middle-hallway-response',
    title: 'Hallway Decision Sprint',
    description: 'Practice choosing the right sequence during a busy passing period.',
    startNodeId: 'start',
    nodes: [
      {
        id: 'start',
        title: 'Passing period incident',
        narrative: 'A student slumps against the lockers during a crowded class change and says they feel faint.',
        choices: [
          { id: 'scan', label: 'Check the area and the student before acting', next: 'alert', effect: 'positive', rationale: 'A fast scene check helps you respond safely.' },
          { id: 'drag', label: 'Drag them toward a classroom immediately', next: 'unsafe', effect: 'negative', rationale: 'Moving them without assessment can be unsafe.' },
        ],
      },
      {
        id: 'alert',
        title: 'You have a quick read on the situation',
        narrative: 'The student is conscious but weak. The hallway is still crowded.',
        choices: [
          { id: 'adult', label: 'Send a nearby student to get a teacher while you stay and report details', next: 'manage', effect: 'positive', rationale: 'You split tasks and communicate clearly.' },
          { id: 'post', label: 'Post for help on social media', next: 'unsafe', effect: 'negative', rationale: 'That does not get immediate support to the scene.' },
        ],
      },
      {
        id: 'manage',
        title: 'Support the response',
        narrative: 'People start slowing down to watch. You need to manage the area until staff arrive.',
        choices: [
          { id: 'clear', label: 'Ask others to keep moving and give space', next: 'good-end', effect: 'positive', rationale: 'This keeps the area safer and calmer.' },
          { id: 'cluster', label: 'Let friends gather closely for comfort', next: 'mixed-end', effect: 'neutral', rationale: 'Crowding can make access and monitoring harder.' },
        ],
      },
      {
        id: 'good-end',
        title: 'Strong response',
        narrative: 'Staff arrive quickly, the hallway stays organized, and your information helps the response.',
        terminal: true,
        outcome: {
          heading: 'Strong sequence decisions',
          summary: 'You assessed, alerted, and managed the area in a responsible order.',
          success: true,
          readinessDelta: 28,
        },
      },
      {
        id: 'mixed-end',
        title: 'Partly effective response',
        narrative: 'Help arrived, but the crowd made it harder for staff to reach the student smoothly.',
        terminal: true,
        outcome: {
          heading: 'Good intent, tighter scene control needed',
          summary: 'You took useful action, but calmer crowd management would improve the response.',
          success: true,
          readinessDelta: 16,
        },
      },
      {
        id: 'unsafe',
        title: 'Unsafe choice',
        narrative: 'An adult explains that fast movement or delayed real help could have increased risk.',
        terminal: true,
        outcome: {
          heading: 'Reset your response sequence',
          summary: 'Start with a quick safety check, alert the right adult help, and support the scene responsibly.',
          success: false,
          readinessDelta: 6,
        },
      },
    ],
  },
  results: {
    headline: 'Middle school response feedback',
    encouragement: 'At this stage, strong first-aid learning means following a safe sequence and giving adults good information quickly.',
    nextStep: 'Review where your sequence broke down, then replay the loop to improve your readiness.',
    awarenessBands: [
      { min: 85, label: 'Reliable responder', description: 'You show strong awareness and good response sequencing.' },
      { min: 60, label: 'Developing responder', description: 'You understand the basics and need more consistency under pressure.' },
      { min: 0, label: 'Needs more practice', description: 'Focus on scene checking, alerting adults, and avoiding impulsive actions.' },
    ],
  },
};
