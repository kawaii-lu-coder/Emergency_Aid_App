import { StageContent } from '@/lib/types/content';

export const highStageContent: StageContent = {
  stage: {
    key: 'high',
    label: 'High School',
    shortLabel: 'High',
    audience: 'Older learners ready for more realistic judgment and reasoning.',
    tone: 'Confident, analytical, action-oriented',
    theme: 'amber',
    journeyLabel: 'Evaluate, coordinate, respond with judgment',
    lessonSlug: 'high-campus-assessment',
    quizSlug: 'high-campus-assessment-quiz',
    scenarioSlug: 'high-campus-courtyard',
  },
  stageSummary: 'A more advanced loop that emphasizes decision quality, situational judgment, and coordinated response behavior.',
  lesson: {
    slug: 'high-campus-assessment',
    title: 'First response judgment when someone collapses on campus',
    description: 'A stage-appropriate lesson on rapid assessment, escalation, and scene coordination during a suspected fainting incident.',
    estimatedMinutes: 6,
    objectives: [
      'Recognize the key priorities in a fainting-related incident.',
      'Escalate quickly with useful details.',
      'Support the scene without taking unsafe or untrained actions.',
    ],
    sections: [
      {
        title: '1. Prioritize scene assessment',
        body: 'Older learners should focus on hazard awareness, responsiveness, and whether the situation appears stable or escalating.',
      },
      {
        title: '2. Escalate with relevant detail',
        body: 'Communicate what happened, where the person is, and what condition they appear to be in so support arrives prepared.',
        bullets: ['Location', 'Responsiveness', 'Visible risk factors', 'Need for crowd control'],
      },
      {
        title: '3. Coordinate the response zone',
        body: 'High school students can be asked to help direct foot traffic, bring the right adult help, or keep the person’s area clear while monitoring for change.',
      },
    ],
    takeaway: 'Good judgment is not doing the most—it is doing the safest useful thing in the right order.',
  },
  quiz: {
    slug: 'high-campus-assessment-quiz',
    title: 'Rapid Response Quiz',
    description: 'A higher-complexity check on judgment, escalation, and safe support.',
    badgeLabel: 'Prepared Responder',
    questions: [
      {
        id: 'h1',
        prompt: 'Which response shows the best situational judgment when a student collapses in the courtyard?',
        options: [
          { id: 'a', label: 'Quickly assess the area, check responsiveness, and alert staff with details' },
          { id: 'b', label: 'Guess what happened and move them immediately' },
          { id: 'c', label: 'Wait to see if they get up on their own before telling anyone' },
        ],
        correctOptionId: 'a',
        explanation: 'Strong response starts with assessment and clear escalation, not assumption.',
        competency: 'sequence',
      },
      {
        id: 'h2',
        prompt: 'What makes an emergency message most useful?',
        options: [
          { id: 'a', label: 'Specific location and observed condition' },
          { id: 'b', label: 'Maximum drama and urgency words' },
          { id: 'c', label: 'A message with no details so others investigate' },
        ],
        correctOptionId: 'a',
        explanation: 'Useful details help the responder prepare and act faster.',
        competency: 'help-seeking',
      },
      {
        id: 'h3',
        prompt: 'What is the best role for a nearby student after help has been called?',
        options: [
          { id: 'a', label: 'Control crowding and keep the route clear' },
          { id: 'b', label: 'Ask everyone to gather close for updates' },
          { id: 'c', label: 'Invent a treatment plan' },
        ],
        correctOptionId: 'a',
        explanation: 'Supporting access and scene control is a safe, high-value action.',
        competency: 'awareness',
      },
      {
        id: 'h4',
        prompt: 'Which choice best reflects readiness rather than panic?',
        options: [
          { id: 'a', label: 'Calmly assigning one person to get staff and one to clear space' },
          { id: 'b', label: 'Everyone trying something different at once' },
          { id: 'c', label: 'Recording the incident for later review' },
        ],
        correctOptionId: 'a',
        explanation: 'Readiness is visible in coordination and controlled action.',
        competency: 'safety',
      },
    ],
  },
  scenario: {
    slug: 'high-campus-courtyard',
    title: 'Courtyard Response Simulation',
    description: 'A more advanced branching scenario focused on judgment under pressure.',
    startNodeId: 'start',
    nodes: [
      {
        id: 'start',
        title: 'Courtyard collapse',
        narrative: 'During lunch, a student collapses near the courtyard steps. People nearby are startled and traffic is building around the area.',
        choices: [
          { id: 'assess', label: 'Assess the scene, responsiveness, and access route', next: 'escalate', effect: 'positive', rationale: 'This creates a safer and more informed response.' },
          { id: 'improvise', label: 'Immediately attempt your own treatment plan', next: 'unsafe', effect: 'negative', rationale: 'Untrained improvisation can increase risk.' },
        ],
      },
      {
        id: 'escalate',
        title: 'You have a quick assessment',
        narrative: 'The student is breathing and weak. You need adult support and scene control quickly.',
        choices: [
          { id: 'coordinate', label: 'Send one student to staff, give details, and keep the route clear', next: 'monitor', effect: 'positive', rationale: 'You coordinate support while preserving access.' },
          { id: 'crowdsource', label: 'Ask a large group what they think should happen', next: 'mixed', effect: 'neutral', rationale: 'Too many uncoordinated voices slow the response.' },
        ],
      },
      {
        id: 'monitor',
        title: 'Coordinated waiting period',
        narrative: 'Help is on the way. The student remains weak and the area needs active management.',
        choices: [
          { id: 'clear-route', label: 'Keep others back and watch for changes while staff approach', next: 'good-end', effect: 'positive', rationale: 'This maintains safe access and situational awareness.' },
          { id: 'lift', label: 'Help friends move the student upright to speed things up', next: 'unsafe', effect: 'negative', rationale: 'Moving the person without direction may be unsafe.' },
        ],
      },
      {
        id: 'good-end',
        title: 'Coordinated outcome',
        narrative: 'Staff reach the scene quickly because the route is clear and your information is specific.',
        terminal: true,
        outcome: {
          heading: 'Prepared, coordinated response',
          summary: 'You showed judgment, useful escalation, and calm scene coordination.',
          success: true,
          readinessDelta: 30,
        },
      },
      {
        id: 'mixed',
        title: 'Partly coordinated outcome',
        narrative: 'Help arrives, but confusion among bystanders slowed the response and cluttered the area.',
        terminal: true,
        outcome: {
          heading: 'Useful instincts, stronger coordination needed',
          summary: 'You recognized the need for help, but clear role assignment would strengthen the response.',
          success: true,
          readinessDelta: 18,
        },
      },
      {
        id: 'unsafe',
        title: 'Unsafe outcome',
        narrative: 'Staff explain that acting without assessment or moving the student early increased risk.',
        terminal: true,
        outcome: {
          heading: 'Reset around judgment and sequence',
          summary: 'Assess first, escalate with details, and support access rather than improvising care.',
          success: false,
          readinessDelta: 5,
        },
      },
    ],
  },
  results: {
    headline: 'High school readiness feedback',
    encouragement: 'Readiness at this stage is about judgment, clarity, and coordinated support—not trying to do everything yourself.',
    nextStep: 'Use the quiz and scenario together to sharpen decision quality under pressure.',
    awarenessBands: [
      { min: 85, label: 'Prepared responder', description: 'You show strong judgment and coordinated support behavior.' },
      { min: 60, label: 'Capable but inconsistent', description: 'You understand the priorities and still need tighter execution.' },
      { min: 0, label: 'Needs another pass', description: 'Focus on assessment, escalation, and avoiding improvised action.' },
    ],
  },
};
