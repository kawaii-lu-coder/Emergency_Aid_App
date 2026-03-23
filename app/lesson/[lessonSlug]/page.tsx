import { notFound } from 'next/navigation';
import { LessonView } from '@/components/LessonView';
import { getStageForLesson } from '@/lib/content/stages';

export default async function LessonPage({ params }: { params: Promise<{ lessonSlug: string }> }) {
  const { lessonSlug } = await params;
  const content = getStageForLesson(lessonSlug);
  if (!content) {
    notFound();
  }

  return <LessonView content={content} />;
}
