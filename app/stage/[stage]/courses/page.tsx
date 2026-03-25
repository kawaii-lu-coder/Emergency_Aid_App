import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SectionCard } from '@/components/SectionCard';
import { CourseProgressRing } from '@/components/course/CourseProgressRing';
import { isStageKey } from '@/lib/content/stages';
import { createServerSupabase } from '@/lib/supabase-server';
import { CourseWithProgress } from '@/lib/types/course';
import { StageKey } from '@/lib/types/content';
import { requireAuth } from '@/lib/auth/roles';

interface CoursesPageProps {
  params: Promise<{ stage: string }>;
}

export default async function CoursesPage({ params }: CoursesPageProps) {
  const { stage } = await params;
  
  // Validate stage parameter
  if (!isStageKey(stage)) {
    notFound();
  }

  const stageKey = stage as StageKey;

  // Require authentication
  const user = await requireAuth();

  // Fetch courses with progress for this stage
  const supabase = await createServerSupabase();
  const { data: courses, error } = await supabase
    .from('courses')
    .select(`
      *,
      course_progress(progress_percent, is_completed, last_position)
    `)
    .eq('stage', stageKey)
    .eq('published', true)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching courses:', error);
    throw new Error('Failed to load courses');
  }

  const coursesWithProgress = courses as CourseWithProgress[];

  // Get recent course (for "Continue Learning" section)
  const recentCourse = coursesWithProgress
    .filter(c => c.course_progress && c.course_progress.length > 0)
    .sort((a, b) => {
      const aTime = a.course_progress?.[0]?.updated_at || '';
      const bTime = b.course_progress?.[0]?.updated_at || '';
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    })[0];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-fade-in-up" style={{ animationFillMode: 'both' }}>
        <SectionCard>
          <div className="flex items-center gap-2 mb-2">
            <Link 
              href={`/stage/${stageKey}`}
              className="text-sm text-apple-text-secondary hover:text-apple-blue transition-colors"
            >
              {stageKey.charAt(0).toUpperCase() + stageKey.slice(1)}
            </Link>
            <span className="text-apple-text-secondary">/</span>
            <span className="text-sm text-apple-text-secondary">Courses</span>
          </div>
          <h1 className="text-3xl font-semibold text-apple-text">Course Center</h1>
          <p className="mt-2 text-apple-text-secondary">
            Learn first aid skills through interactive video lessons and presentations.
          </p>
        </SectionCard>
      </div>

      {/* Continue Learning Section */}
      {recentCourse && (
        <div className="animate-fade-in-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
          <SectionCard className="bg-gradient-to-br from-apple-blue/5 to-transparent border-apple-blue/20">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-apple-blue/10 text-apple-blue mb-3">
                  Continue Learning
                </span>
                <h2 className="text-xl font-semibold text-apple-text">{recentCourse.title}</h2>
                <p className="mt-1 text-apple-text-secondary text-sm line-clamp-2">{recentCourse.description}</p>
                
                {/* Progress bar */}
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-apple-blue rounded-full transition-all duration-300"
                      style={{ width: `${recentCourse.course_progress?.[0]?.progress_percent || 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-apple-text-secondary">
                    {recentCourse.course_progress?.[0]?.progress_percent || 0}%
                  </span>
                </div>

                <Link
                  href={`/stage/${stageKey}/courses/${recentCourse.id}`}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-apple-blue text-white text-sm font-medium
                             transition-all duration-200 hover:bg-apple-blue-hover hover:-translate-y-0.5 hover:shadow-md hover:shadow-apple-blue/30
                             active:scale-[0.98]"
                >
                  {recentCourse.course_progress?.[0]?.progress_percent && recentCourse.course_progress[0].progress_percent > 0 
                    ? 'Continue' 
                    : 'Start Learning'}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              
              {recentCourse.thumbnail_url && (
                <img 
                  src={recentCourse.thumbnail_url} 
                  alt={recentCourse.title}
                  className="w-32 h-20 object-cover rounded-2xl hidden sm:block"
                />
              )}
            </div>
          </SectionCard>
        </div>
      )}

      {/* Course Grid */}
      <div className="animate-fade-in-up" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
        <h2 className="text-xl font-semibold text-apple-text mb-4">All Courses</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {coursesWithProgress.map((course, index) => {
            const progress = course.course_progress?.[0]?.progress_percent || 0;
            const isCompleted = course.course_progress?.[0]?.is_completed || false;
            const hasProgress = progress > 0;

            return (
              <Link
                key={course.id}
                href={`/stage/${stageKey}/courses/${course.id}`}
                className="group"
                style={{ animationDelay: `${300 + index * 50}ms` }}
              >
                <SectionCard className="h-full p-0 overflow-hidden hover:-translate-y-1 hover:shadow-apple-xl">
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-gray-100">
                    {course.thumbnail_url ? (
                      <img 
                        src={course.thumbnail_url} 
                        alt={course.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-apple-blue/10 to-apple-mint/10">
                        <svg className="w-12 h-12 text-apple-text-secondary/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    )}
                    
                    {/* Type badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                                       ${course.type === 'video' 
                                         ? 'bg-red-500/90 text-white' 
                                         : 'bg-blue-500/90 text-white'}`}>
                        {course.type === 'video' ? (
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        ) : (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        )}
                        {course.type === 'video' ? 'Video' : 'PPT'}
                      </span>
                    </div>

                    {/* Completed badge */}
                    {isCompleted && (
                      <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-apple-mint/90 text-white">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Completed
                        </span>
                      </div>
                    )}

                    {/* Progress ring overlay */}
                    {hasProgress && !isCompleted && (
                      <div className="absolute bottom-3 right-3">
                        <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-md shadow-apple-md flex items-center justify-center">
                          <CourseProgressRing progress={progress} size={40} strokeWidth={3} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-apple-text group-hover:text-apple-blue transition-colors line-clamp-1">
                      {course.title}
                    </h3>
                    <p className="mt-1 text-sm text-apple-text-secondary line-clamp-2">
                      {course.description}
                    </p>
                    <div className="mt-3 flex items-center justify-between text-xs text-apple-text-secondary">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {course.type === 'video' 
                          ? formatDuration(course.duration) 
                          : `${course.duration} slides`}
                      </span>
                      {hasProgress && !isCompleted && (
                        <span className="text-apple-blue font-medium">{progress}%</span>
                      )}
                    </div>
                  </div>
                </SectionCard>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins >= 60) {
    const hours = Math.floor(mins / 60);
    return `${hours}h ${mins % 60}m`;
  }
  return `${mins}m ${secs}s`;
}
