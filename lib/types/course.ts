import { StageKey } from './content';

export type CourseType = 'video' | 'ppt';

export interface Course {
  id: string;
  title: string;
  description: string;
  stage: StageKey;
  type: CourseType;
  content_url: string;
  thumbnail_url: string | null;
  duration: number;
  order_index: number;
  created_at: string;
  published: boolean;
}

export interface CourseProgress {
  id: string;
  user_id: string;
  course_id: string;
  stage: StageKey;
  last_position: number;
  progress_percent: number;
  is_completed: boolean;
  completed_at: string | null;
  updated_at: string;
}

export interface CourseWithProgress extends Course {
  course_progress?: CourseProgress[] | null;
}

export interface CourseListItemProps {
  course: CourseWithProgress;
  stage: StageKey;
}

export interface VideoPlayerProps {
  src: string;
  courseId: string;
  stage: StageKey;
  initialProgress?: number;
  duration: number;
  onProgressUpdate?: (percent: number, isCompleted: boolean) => void;
}

export interface PPTViewerProps {
  slides: string[];
  courseId: string;
  stage: StageKey;
  initialPage?: number;
  onProgressUpdate?: (percent: number, isCompleted: boolean) => void;
}

export interface CourseProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  showPercentage?: boolean;
}

export interface SaveProgressRequest {
  course_id: string;
  last_position: number;
  progress_percent: number;
}

export interface SaveProgressResponse {
  success: boolean;
  is_completed?: boolean;
  error?: string;
}
