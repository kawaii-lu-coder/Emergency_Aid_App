import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isStageKey } from '@/lib/content/stages';
import { createServerSupabase } from '@/lib/supabase-server';
import { requireAuth } from '@/lib/auth/roles';
import { StageKey } from '@/lib/types/content';

interface CourseLayoutProps {
  children: React.ReactNode;
  params: Promise<{ stage: string; courseId: string }>;
}

export default async function CourseLayout({ children, params }: CourseLayoutProps) {
  const { stage, courseId } = await params;

  // Validate stage
  if (!isStageKey(stage)) {
    notFound();
  }

  const stageKey = stage as StageKey;

  // Require authentication
  await requireAuth();

  // Fetch course details
  const supabase = await createServerSupabase();
  const { data: course, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .eq('stage', stageKey)
    .single();

  if (error || !course) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      {/* Fixed Header with Progress */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-apple-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-4">
            {/* Back button */}
            <Link
              href={`/stage/${stageKey}/courses`}
              className="flex items-center gap-2 text-apple-text-secondary hover:text-apple-blue transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline text-sm font-medium">Back to Courses</span>
            </Link>

            {/* Course title */}
            <div className="flex-1 min-w-0">
              <h1 className="text-sm sm:text-base font-semibold text-apple-text truncate">
                {course.title}
              </h1>
            </div>

            {/* Type badge */}
            <span className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium
                             ${course.type === 'video' 
                               ? 'bg-red-100 text-red-700' 
                               : 'bg-blue-100 text-blue-700'}`}>
              {course.type === 'video' ? 'Video' : 'PPT'}
            </span>
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div 
                id="course-progress-bar"
                className="h-full bg-apple-blue rounded-full transition-all duration-300"
                style={{ width: '0%' }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-24 pb-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
