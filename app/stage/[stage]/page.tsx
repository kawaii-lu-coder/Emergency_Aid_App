import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SectionCard } from '@/components/SectionCard';
import { CourseProgressRing } from '@/components/course/CourseProgressRing';
import { getStageContent, isStageKey } from '@/lib/content/stages';
import { createServerSupabase } from '@/lib/supabase-server';
import { requireAuth } from '@/lib/auth/roles';

export default async function StagePage({ params }: { params: Promise<{ stage: string }> }) {
  const { stage } = await params;
  if (!isStageKey(stage)) {
    notFound();
  }

  const content = getStageContent(stage);
  
  // Fetch recent course progress for "Continue Learning" section
  let recentCourse = null;
  try {
    const user = await requireAuth();
    const supabase = await createServerSupabase();
    const { data: courses } = await supabase
      .from('courses')
      .select(`
        *,
        course_progress(progress_percent, is_completed, last_position)
      `)
      .eq('stage', stage)
      .eq('published', true)
      .order('order_index', { ascending: true });
    
    if (courses && courses.length > 0) {
      recentCourse = courses
        .filter((c: any) => c.course_progress && c.course_progress.length > 0)
        .sort((a: any, b: any) => {
          const aTime = a.course_progress?.[0]?.updated_at || '';
          const bTime = b.course_progress?.[0]?.updated_at || '';
          return new Date(bTime).getTime() - new Date(aTime).getTime();
        })[0] || courses[0]; // Default to first course if no progress
    }
  } catch {
    // User not logged in or other error - continue without recent course
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="animate-fade-in-up" style={{ animationFillMode: 'both' }}>
        <SectionCard>
          <p className="text-sm uppercase tracking-[0.32em] text-apple-text-secondary">{content.stage.label}</p>
          <h1 className="mt-2 text-4xl font-semibold text-apple-text">{content.stage.journeyLabel}</h1>
          <p className="mt-3 max-w-3xl text-apple-text-secondary leading-relaxed">{content.stageSummary}</p>
        </SectionCard>
      </div>

      {/* Continue Learning / Course Center Card */}
      {recentCourse && (
        <div className="animate-fade-in-up" style={{ animationDelay: '50ms', animationFillMode: 'both' }}>
          <SectionCard className="bg-gradient-to-br from-apple-blue/5 to-apple-mint/5 border-apple-blue/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {recentCourse.thumbnail_url ? (
                  <img 
                    src={recentCourse.thumbnail_url} 
                    alt={recentCourse.title}
                    className="w-20 h-14 object-cover rounded-xl hidden sm:block"
                  />
                ) : (
                  <div className="w-20 h-14 rounded-xl bg-apple-blue/10 flex items-center justify-center hidden sm:flex">
                    <svg className="w-8 h-8 text-apple-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                )}
                <div>
                  <p className="text-sm text-apple-text-secondary">
                    {recentCourse.course_progress?.[0]?.progress_percent > 0 ? 'Continue Learning' : 'Start Learning'}
                  </p>
                  <h3 className="text-lg font-semibold text-apple-text">{recentCourse.title}</h3>
                  {recentCourse.course_progress?.[0]?.progress_percent > 0 && (
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex-1 w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-apple-blue rounded-full transition-all duration-300"
                          style={{ width: `${recentCourse.course_progress[0].progress_percent}%` }}
                        />
                      </div>
                      <span className="text-xs text-apple-text-secondary">
                        {recentCourse.course_progress[0].progress_percent}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={`/stage/${stage}/courses/${recentCourse.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-apple-blue text-white text-sm font-medium
                             transition-all duration-200 hover:bg-apple-blue-hover hover:-translate-y-0.5 hover:shadow-md hover:shadow-apple-blue/30
                             active:scale-[0.98]"
                >
                  {recentCourse.course_progress?.[0]?.progress_percent > 0 ? 'Continue' : 'Start'}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  href={`/stage/${stage}/courses`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-apple-text text-sm font-medium
                             border border-apple-border/50 transition-all duration-200 hover:bg-gray-50 hover:-translate-y-0.5
                             active:scale-[0.98]"
                >
                  All Courses
                </Link>
              </div>
            </div>
          </SectionCard>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.15fr,0.85fr]">
        {/* Stage Loop */}
        <div className="animate-fade-in-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
          <SectionCard>
            <h2 className="text-2xl font-semibold text-apple-text">Stage loop</h2>
            <div className="mt-4 grid gap-3 text-sm">
              {[
                { step: '1', title: 'Learn', desc: content.lesson.title },
                { step: '2', title: 'Quiz', desc: content.quiz.description },
                { step: '3', title: 'Scenario', desc: content.scenario.description },
                { step: '4', title: 'Feedback', desc: content.results.nextStep },
              ].map((item, index) => (
                <div 
                  key={item.step}
                  className="rounded-2xl border border-apple-border/50 bg-white px-4 py-4
                             transition-all duration-200 ease-apple
                             hover:border-apple-blue/50 hover:shadow-apple-sm hover:-translate-y-0.5"
                  style={{ animationDelay: `${200 + index * 50}ms` }}
                >
                  <strong className="text-apple-text">{item.step}. {item.title}</strong>
                  <p className="mt-1 text-apple-text-secondary">{item.desc}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* Stage Profile */}
        <div className="animate-fade-in-up" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
          <SectionCard>
            <h2 className="text-2xl font-semibold text-apple-text">Stage profile</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="group">
                <dt className="text-apple-text-secondary transition-colors duration-200 group-hover:text-apple-text">Audience</dt>
                <dd className="text-apple-text">{content.stage.audience}</dd>
              </div>
              <div className="group">
                <dt className="text-apple-text-secondary transition-colors duration-200 group-hover:text-apple-text">Tone</dt>
                <dd className="text-apple-text">{content.stage.tone}</dd>
              </div>
              <div className="group">
                <dt className="text-apple-text-secondary transition-colors duration-200 group-hover:text-apple-text">Objectives</dt>
                <dd className="text-apple-text">{content.lesson.objectives.length} objectives in this loop</dd>
              </div>
            </dl>
            <Link 
              href={`/lesson/${content.lesson.slug}`} 
              className="mt-6 flex w-full items-center justify-center rounded-full bg-apple-blue px-4 py-3 font-medium text-white 
                         transition-all duration-200 ease-apple
                         hover:bg-apple-blue-hover hover:-translate-y-0.5 hover:shadow-md hover:shadow-apple-blue/30
                         active:scale-[0.98] active:shadow-none active:brightness-[0.97]"
            >
              Start {content.stage.shortLabel} lesson
            </Link>
            
            {/* Course Center Button */}
            <Link 
              href={`/stage/${stage}/courses`} 
              className="mt-3 flex w-full items-center justify-center rounded-full bg-white border border-apple-border/50 
                         px-4 py-3 font-medium text-apple-text
                         transition-all duration-200 ease-apple
                         hover:bg-gray-50 hover:-translate-y-0.5 hover:shadow-md
                         active:scale-[0.98] active:shadow-none"
            >
              <svg className="w-5 h-5 mr-2 text-apple-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Course Center
            </Link>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
