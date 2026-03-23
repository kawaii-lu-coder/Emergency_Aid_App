'use client';

import ReactECharts from 'echarts-for-react';
import { AttemptRecord } from '@/lib/types/content';
import { StageSummary } from '@/lib/utils/analytics';
import { SectionCard } from '@/components/SectionCard';

export function TeacherDashboardClient({
  attempts,
  summaries,
  metrics,
  accuracy,
}: {
  attempts: AttemptRecord[];
  summaries: StageSummary[];
  metrics: { totalAttempts: number; totalCompleted: number; averageReadiness: number };
  accuracy: Array<{ skill: string; primary: number; middle: number; high: number }>;
}) {
  const completionOption = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: summaries.map((entry) => entry.stageLabel), axisLabel: { color: '#cbd5e1' } },
    yAxis: { type: 'value', max: 100, axisLabel: { color: '#cbd5e1' } },
    series: [{ type: 'bar', data: summaries.map((entry) => entry.completionRate), itemStyle: { color: '#38bdf8' } }],
    backgroundColor: 'transparent',
  };

  const scoreOption = {
    tooltip: { trigger: 'axis' },
    legend: { textStyle: { color: '#cbd5e1' } },
    xAxis: { type: 'category', data: summaries.map((entry) => entry.stageLabel), axisLabel: { color: '#cbd5e1' } },
    yAxis: { type: 'value', max: 100, axisLabel: { color: '#cbd5e1' } },
    series: [
      { name: 'Quiz %', type: 'line', data: summaries.map((entry) => entry.averageQuizPercent), smooth: true, lineStyle: { color: '#34d399' } },
      { name: 'Scenario success %', type: 'line', data: summaries.map((entry) => entry.scenarioSuccessRate), smooth: true, lineStyle: { color: '#fbbf24' } },
    ],
    backgroundColor: 'transparent',
  };

  return (
    <div className="space-y-6">
      <SectionCard>
        <p className="text-sm uppercase tracking-[0.3em] text-sky-200/80">Teacher analytics</p>
        <h1 className="mt-2 text-4xl font-semibold text-white">Stage-aware feedback dashboard</h1>
        <p className="mt-3 max-w-3xl text-slate-300">
          Compare completion, quiz performance, scenario success, and readiness signals across primary, middle, and high school loops.
        </p>
      </SectionCard>

      <div className="grid gap-6 md:grid-cols-3">
        <SectionCard>
          <p className="text-sm text-slate-400">Total attempts</p>
          <div className="mt-2 text-4xl font-semibold text-white">{metrics.totalAttempts}</div>
        </SectionCard>
        <SectionCard>
          <p className="text-sm text-slate-400">Completions</p>
          <div className="mt-2 text-4xl font-semibold text-white">{metrics.totalCompleted}</div>
        </SectionCard>
        <SectionCard>
          <p className="text-sm text-slate-400">Average readiness</p>
          <div className="mt-2 text-4xl font-semibold text-white">{metrics.averageReadiness}</div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard>
          <h2 className="text-2xl font-semibold text-white">Completion by stage</h2>
          <ReactECharts option={completionOption} style={{ height: 320 }} />
        </SectionCard>
        <SectionCard>
          <h2 className="text-2xl font-semibold text-white">Score and scenario comparison</h2>
          <ReactECharts option={scoreOption} style={{ height: 320 }} />
        </SectionCard>
      </div>

      <SectionCard>
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold text-white">Stage summaries</h2>
          <p className="text-sm text-slate-400">Awareness = quiz confidence proxy · Readiness = scenario response quality</p>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-200">
            <thead className="text-slate-400">
              <tr>
                <th className="px-3 py-2">Stage</th>
                <th className="px-3 py-2">Attempts</th>
                <th className="px-3 py-2">Completion rate</th>
                <th className="px-3 py-2">Avg quiz %</th>
                <th className="px-3 py-2">Scenario success</th>
                <th className="px-3 py-2">Awareness</th>
                <th className="px-3 py-2">Readiness</th>
              </tr>
            </thead>
            <tbody>
              {summaries.map((summary) => (
                <tr key={summary.stage} className="border-t border-white/10">
                  <td className="px-3 py-3 font-medium text-white">{summary.stageLabel}</td>
                  <td className="px-3 py-3">{summary.attempts}</td>
                  <td className="px-3 py-3">{summary.completionRate}%</td>
                  <td className="px-3 py-3">{summary.averageQuizPercent}%</td>
                  <td className="px-3 py-3">{summary.scenarioSuccessRate}%</td>
                  <td className="px-3 py-3">{summary.averageAwareness}</td>
                  <td className="px-3 py-3">{summary.averageReadiness}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <SectionCard>
          <h2 className="text-2xl font-semibold text-white">Question accuracy by stage</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-200">
              <thead className="text-slate-400">
                <tr>
                  <th className="px-3 py-2">Skill</th>
                  <th className="px-3 py-2">Primary</th>
                  <th className="px-3 py-2">Middle</th>
                  <th className="px-3 py-2">High</th>
                </tr>
              </thead>
              <tbody>
                {accuracy.map((row) => (
                  <tr key={row.skill} className="border-t border-white/10">
                    <td className="px-3 py-3 font-medium text-white">{row.skill}</td>
                    <td className="px-3 py-3">{row.primary}%</td>
                    <td className="px-3 py-3">{row.middle}%</td>
                    <td className="px-3 py-3">{row.high}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
        <SectionCard>
          <h2 className="text-2xl font-semibold text-white">Attempts table</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-200">
              <thead className="text-slate-400">
                <tr>
                  <th className="px-3 py-2">Learner</th>
                  <th className="px-3 py-2">Stage</th>
                  <th className="px-3 py-2">Quiz</th>
                  <th className="px-3 py-2">Scenario</th>
                  <th className="px-3 py-2">Readiness</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((attempt) => (
                  <tr key={attempt.id} className="border-t border-white/10">
                    <td className="px-3 py-3 font-medium text-white">{attempt.learner}</td>
                    <td className="px-3 py-3 capitalize">{attempt.stage}</td>
                    <td className="px-3 py-3">{attempt.quizScore}/{attempt.quizTotal}</td>
                    <td className="px-3 py-3">{attempt.scenarioSuccess ? 'Success' : 'Needs support'}</td>
                    <td className="px-3 py-3">{attempt.readinessScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
