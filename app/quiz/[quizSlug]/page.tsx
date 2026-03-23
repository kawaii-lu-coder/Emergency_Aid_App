import { notFound } from 'next/navigation';
import { QuizView } from '@/components/QuizView';
import { getStageForQuiz } from '@/lib/content/stages';

export default async function QuizPage({ params }: { params: Promise<{ quizSlug: string }> }) {
  const { quizSlug } = await params;
  const content = getStageForQuiz(quizSlug);
  if (!content) {
    notFound();
  }

  return <QuizView content={content} />;
}
