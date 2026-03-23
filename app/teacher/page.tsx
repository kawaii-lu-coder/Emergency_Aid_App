import { TeacherDashboardClient } from '@/components/TeacherDashboardClient';
import { overallMetrics, questionAccuracyByStage, summarizeAttempts } from '@/lib/utils/analytics';
import { listAttempts } from '@/lib/utils/storage';

export default function TeacherPage() {
  const attempts = listAttempts();
  const summaries = summarizeAttempts(attempts);
  const metrics = overallMetrics(attempts);
  const accuracy = questionAccuracyByStage();

  return <TeacherDashboardClient attempts={attempts} summaries={summaries} metrics={metrics} accuracy={accuracy} />;
}
