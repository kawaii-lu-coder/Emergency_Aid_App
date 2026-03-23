import { NextResponse } from 'next/server';
import { isStageKey } from '@/lib/content/stages';
import { completeLesson } from '@/lib/utils/storage';

export async function POST(request: Request) {
  const body = (await request.json()) as { stage?: string; learner?: string };
  if (!body.stage || !isStageKey(body.stage)) {
    return NextResponse.json({ error: 'Invalid stage' }, { status: 400 });
  }

  const attempt = completeLesson(body.stage, body.learner || 'Demo learner');
  return NextResponse.json({ attempt });
}
