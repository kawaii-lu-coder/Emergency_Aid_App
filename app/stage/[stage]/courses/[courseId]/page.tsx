'use client';

import { useEffect, useState, useCallback } from 'react';
import { notFound } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { SectionCard } from '@/components/SectionCard';
import { VideoPlayer } from '@/components/course/VideoPlayer';
import { PPTViewer } from '@/components/course/PPTViewer';
import { CourseProgressRing } from '@/components/course/CourseProgressRing';
import { Course, CourseProgress } from '@/lib/types/course';
import { StageKey } from '@/lib/types/content';
import { isStageKey } from '@/lib/content/stages';

interface CoursePageProps {
  params: Promise<{ stage: string; courseId: string }>;
}

export default function CoursePage({ params }: CoursePageProps) {
  const [course, setCourse] = useState<Course | null>(null);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentProgressPercent, setCurrentProgressPercent] = useState(0);
  const [stage, setStage] = useState<StageKey>('primary');
  const [courseId, setCourseId] = useState<string>('');
  const [showCompleteAnimation, setShowCompleteAnimation] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  useEffect(() => {
    params.then(({ stage: s, courseId: cid }) => {
      if (!isStageKey(s)) {
        notFound();
      }
      setStage(s as StageKey);
      setCourseId(cid);
    });
  }, [params]);

  // Fetch course data
  useEffect(() => {
    if (!courseId || !stage) return;

    const fetchData = async () => {
      try {
        // Fetch course
        const courseRes = await fetch(`/api/stage/${stage}/courses/progress?course_id=${courseId}`, {
          method: 'GET',
        });
        
        if (!courseRes.ok) {
          // Fallback to Supabase client
          const supabase = (await import('@/lib/supabase')).createClient();
          
          const { data: courseData, error: courseError } = await supabase
            .from('courses')
            .select('*')
            .eq('id', courseId)
            .eq('stage', stage)
            .single();

          if (courseError || !courseData) {
            notFound();
          }

          setCourse(courseData);

          // Fetch progress
          const { data: userData } = await supabase.auth.getUser();
          if (userData.user) {
            const { data: progressData } = await supabase
              .from('course_progress')
              .select('*')
              .eq('course_id', courseId)
              .eq('user_id', userData.user.id)
              .single();

            if (progressData) {
              setProgress(progressData);
              setCurrentProgressPercent(progressData.progress_percent);
            }
          }
        } else {
          // Use the API response
          const supabase = (await import('@/lib/supabase')).createClient();
          
          const { data: courseData, error: courseError } = await supabase
            .from('courses')
            .select('*')
            .eq('id', courseId)
            .eq('stage', stage)
            .single();

          if (courseError || !courseData) {
            notFound();
          }

          setCourse(courseData);
          
          // Progress data from API
          const progressData = await courseRes.json();
          if (progressData.progress) {
            setProgress(progressData.progress);
            setCurrentProgressPercent(progressData.progress.progress_percent);
          }
        }
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, stage]);

  // Update header progress bar
  useEffect(() => {
    const progressBar = document.getElementById('course-progress-bar');
    if (progressBar) {
      progressBar.style.width = `${currentProgressPercent}%`;
    }
  }, [currentProgressPercent]);

  // Keyboard shortcut for help
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?') {
        e.preventDefault();
        setShowShortcuts(true);
      }
      if (e.key === 'Escape') {
        setShowShortcuts(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleProgressUpdate = useCallback((percent: number, isCompleted: boolean) => {
    setCurrentProgressPercent(percent);
    if (isCompleted && !progress?.is_completed) {
      setShowCompleteAnimation(true);
      setProgress(prev => prev ? { ...prev, is_completed: true, progress_percent: 100 } : null);
      setTimeout(() => setShowCompleteAnimation(false), 5000);
    }
  }, [progress]);

  const handleComplete = useCallback(() => {
    setCurrentProgressPercent(100);
    setProgress(prev => prev ? { ...prev, is_completed: true, progress_percent: 100 } : null);
    setShowCompleteAnimation(true);
    setTimeout(() => setShowCompleteAnimation(false), 5000);
  }, []);

  const handleMarkComplete = async () => {
    try {
      const response = await fetch(`/api/stage/${stage}/courses/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_id: courseId,
          last_position: course?.type === 'video' ? course.duration : (progress?.last_position || 0),
          progress_percent: 100,
          is_completed: true,
        }),
      });

      if (response.ok) {
        handleComplete();
      }
    } catch (error) {
      console.error('Error marking complete:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-apple-blue"></div>
      </div>
    );
  }

  if (!course) {
    notFound();
  }

  const isCompleted = currentProgressPercent >= 95 || progress?.is_completed;

  return (
    <div className="space-y-6">
      {/* Completion Animation Overlay */}
      <AnimatePresence>
        {showCompleteAnimation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowCompleteAnimation(false)}
          >
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className="bg-white rounded-3xl p-8 shadow-2xl text-center max-w-sm mx-4"
            >
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-apple-mint/20 flex items-center justify-center">
                <CheckIcon className="w-10 h-10 text-apple-mint" />
              </div>
              <h2 className="text-2xl font-bold text-apple-text mb-2">Course Completed!</h2>
              <p className="text-apple-text-secondary mb-6">
                Congratulations on finishing &quot;{course.title}&quot;
              </p>
              <button
                onClick={() => setShowCompleteAnimation(false)}
                className="px-6 py-2.5 bg-apple-blue text-white rounded-full font-medium
                          hover:bg-apple-blue-hover transition-colors"
              >
                Continue Learning
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shortcuts Help Modal */}
      <AnimatePresence>
        {showShortcuts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowShortcuts(false)}
          >
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className="bg-white rounded-3xl p-6 shadow-2xl max-w-md mx-4 w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-apple-text">Keyboard Shortcuts</h2>
                <button onClick={() => setShowShortcuts(false)} className="text-apple-text-secondary hover:text-apple-text">
                  <XIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-2">
                {course.type === 'video' ? (
                  <>
                    <ShortcutItem keys={['Space']} action="Play / Pause" />
                    <ShortcutItem keys={['←', '→']} action="Seek backward / forward 5s" />
                    <ShortcutItem keys={['F']} action="Toggle fullscreen" />
                    <ShortcutItem keys={['M']} action="Toggle mute" />
                  </>
                ) : (
                  <>
                    <ShortcutItem keys={['←']} action="Previous slide" />
                    <ShortcutItem keys={['→']} action="Next slide" />
                    <ShortcutItem keys={['Ctrl', '+', 'Scroll']} action="Zoom in / out" />
                    <ShortcutItem keys={['Double-click']} action="Reset / Toggle zoom" />
                    <ShortcutItem keys={['Esc']} action="Reset zoom" />
                  </>
                )}
                <div className="border-t pt-2 mt-2">
                  <ShortcutItem keys={['?']} action="Show this help" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Course Header */}
      <SectionCard>
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium
                ${course.type === 'video' 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-blue-100 text-blue-700'}`}>
                {course.type === 'video' ? 'Video' : 'PPT'}
              </span>
              {isCompleted && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-apple-mint/10 text-apple-mint">
                  Completed
                </span>
              )}
            </div>
            <h1 className="text-2xl font-semibold text-apple-text">{course.title}</h1>
            <p className="mt-2 text-apple-text-secondary">{course.description}</p>
            
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-apple-text-secondary">
              <span className="flex items-center gap-1">
                <ClockIcon className="w-4 h-4" />
                {course.type === 'video' 
                  ? formatDuration(course.duration) 
                  : `${course.duration} slides`}
              </span>
              <span className="flex items-center gap-1">
                <CalendarIcon className="w-4 h-4" />
                {new Date(course.created_at).toLocaleDateString()}
              </span>
              <button
                onClick={() => setShowShortcuts(true)}
                className="flex items-center gap-1 text-apple-blue hover:underline"
              >
                <KeyboardIcon className="w-4 h-4" />
                Shortcuts (?)
              </button>
            </div>
          </div>

          {/* Progress ring */}
          <div className="hidden sm:block">
            <CourseProgressRing progress={currentProgressPercent} size={64} strokeWidth={5} />
          </div>
        </div>
      </SectionCard>

      {/* Content Player */}
      <SectionCard className="p-0 overflow-hidden">
        {course.type === 'video' ? (
          <VideoPlayer
            src={course.content_url}
            courseId={course.id}
            stage={stage}
            initialProgress={progress?.last_position}
            duration={course.duration}
            onProgressUpdate={handleProgressUpdate}
            onComplete={handleComplete}
          />
        ) : (
          <div className="p-4 sm:p-6">
            <PPTViewer
              slides={JSON.parse(course.content_url)}
              courseId={course.id}
              stage={stage}
              initialPage={Math.floor(progress?.last_position || 0)}
              onProgressUpdate={handleProgressUpdate}
              onComplete={handleComplete}
            />
          </div>
        )}
      </SectionCard>

      {/* Progress & Actions */}
      <SectionCard>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="font-semibold text-apple-text">Your Progress</h3>
            <p className="text-sm text-apple-text-secondary">
              {isCompleted 
                ? 'Congratulations! You have completed this course.' 
                : `You are ${Math.round(currentProgressPercent)}% through this course.`}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Mark Complete Button */}
            {!isCompleted && (
              <button
                onClick={handleMarkComplete}
                className="px-4 py-2 rounded-full bg-apple-mint text-white text-sm font-medium
                           transition-all duration-200 hover:bg-apple-mint/90 hover:-translate-y-0.5
                           active:scale-[0.98] flex items-center gap-1.5"
              >
                <CheckIcon className="w-4 h-4" />
                Mark as Complete
              </button>
            )}
            
            {isCompleted && (
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-apple-mint/10 text-apple-mint text-sm font-medium">
                <CheckIcon className="w-4 h-4" />
                Completed
              </span>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div 
              className={`h-full rounded-full ${isCompleted ? 'bg-apple-mint' : 'bg-apple-blue'}`}
              initial={{ width: 0 }}
              animate={{ width: `${currentProgressPercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

// Shortcut item component
function ShortcutItem({ keys, action }: { keys: string[]; action: string }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-apple-text-secondary text-sm">{action}</span>
      <div className="flex items-center gap-1">
        {keys.map((key, i) => (
          <span key={i} className="flex items-center">
            <kbd className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium text-apple-text min-w-[24px] text-center">
              {key}
            </kbd>
            {i < keys.length - 1 && <span className="mx-1 text-gray-400">+</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

// Icon components
const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const KeyboardIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// Utility function
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins >= 60) {
    const hours = Math.floor(mins / 60);
    return `${hours}h ${mins % 60}m ${secs}s`;
  }
  return `${mins}m ${secs}s`;
}
