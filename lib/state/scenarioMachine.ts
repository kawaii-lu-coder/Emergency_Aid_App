import { createMachine, setup } from 'xstate';
import { ScenarioDefinition } from '@/lib/types/content';

export function createScenarioMachine(scenario: ScenarioDefinition) {
  const nodeMap = Object.fromEntries(scenario.nodes.map((node) => [node.id, node]));

  return setup({
    types: {
      context: {} as { currentNodeId: string; path: string[]; readinessScore: number },
      events: {} as { type: 'CHOOSE'; choiceId: string } | { type: 'RESET' },
    },
  }).createMachine({
    id: `${scenario.slug}-machine`,
    initial: 'active',
    context: {
      currentNodeId: scenario.startNodeId,
      path: [scenario.startNodeId],
      readinessScore: 50,
    },
    states: {
      active: {
        on: {
          CHOOSE: {
            guard: ({ context }) => !nodeMap[context.currentNodeId].terminal,
            actions: ({ context, event }) => {
              const node = nodeMap[context.currentNodeId];
              const choice = node.choices?.find((entry) => entry.id === event.choiceId);
              if (!choice) {
                return;
              }

              context.currentNodeId = choice.next;
              context.path.push(choice.next);
              context.readinessScore = Math.max(
                0,
                Math.min(100, context.readinessScore + (choice.effect === 'positive' ? 18 : choice.effect === 'neutral' ? 8 : -12)),
              );
            },
          },
          RESET: {
            actions: ({ context }) => {
              context.currentNodeId = scenario.startNodeId;
              context.path = [scenario.startNodeId];
              context.readinessScore = 50;
            },
          },
        },
      },
    },
  });
}
