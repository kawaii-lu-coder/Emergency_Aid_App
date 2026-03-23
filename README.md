# Campus First Aid Interactive Learning Platform

A lightweight competition demo built with a **shared stage-aware architecture** instead of three disconnected apps.

## What is implemented

- One shared app shell
- Three stage-specific learner loops:
  - primary school
  - middle school
  - high school
- For each stage:
  - one lesson
  - one gamified quiz
  - one branching scenario
  - one results/feedback page
- One teacher dashboard that aggregates by stage
- Shared typed content model for lessons, quizzes, scenarios, and feedback
- Shared XState-driven scenario engine
- Optional Supabase client wiring with in-memory demo fallback

## Routes

- `/`
- `/stage/primary`
- `/stage/middle`
- `/stage/high`
- `/lesson/[lessonSlug]`
- `/quiz/[quizSlug]`
- `/scenario/[scenarioSlug]`
- `/results/[stage]`
- `/teacher`

## Stack

- Next.js
- TypeScript
- Tailwind CSS
- Supabase
- ECharts
- XState

## Run locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start dev server:

   ```bash
   npm run dev
   ```

3. Open `http://localhost:3000`

## Supabase mode

This repo is runnable without Supabase credentials because it falls back to an in-memory demo store.

If you want to connect a real Supabase project, add:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

## Notes

- Content is intentionally lightweight and stage-configurable.
- The teacher dashboard uses demo aggregation and seeded records suitable for a competition presentation.
- XState is used only for the branching scenario flow.
