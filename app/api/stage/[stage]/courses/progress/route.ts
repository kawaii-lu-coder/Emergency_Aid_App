import { requireAuth } from '@/lib/auth/roles';
import { createServerSupabase } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';
import { isStageKey } from '@/lib/content/stages';
import { StageKey } from '@/lib/types/content';

// POST: Save course progress
export async function POST(
  request: Request,
  { params }: { params: Promise<{ stage: string }> }
) {
  try {
    const { stage } = await params;
    
    // Validate stage
    if (!isStageKey(stage)) {
      return NextResponse.json({ error: 'Invalid stage' }, { status: 400 });
    }

    const stageKey = stage as StageKey;
    
    // Require authentication
    const user = await requireAuth();
    
    const body = await request.json();
    const { course_id, last_position, progress_percent, is_completed } = body;
    
    if (!course_id) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }
    
    // Verify course exists and belongs to this stage
    const supabase = await createServerSupabase();
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, stage, duration, type')
      .eq('id', course_id)
      .eq('stage', stageKey)
      .single();
    
    if (courseError || !course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    
    // Calculate completion status
    const calculatedPercent = Math.min(100, Math.max(0, progress_percent || 0));
    const shouldComplete = is_completed || calculatedPercent >= 95 || 
                          (course.type === 'video' && last_position >= course.duration * 0.95) ||
                          (course.type === 'ppt' && last_position >= course.duration - 1);
    
    // Upsert progress
    const { error: upsertError } = await supabase
      .from('course_progress')
      .upsert({
        user_id: user.id,
        course_id,
        stage: stageKey,
        last_position: Math.min(last_position, course.duration),
        progress_percent: shouldComplete ? 100 : calculatedPercent,
        is_completed: shouldComplete,
        completed_at: shouldComplete ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,course_id',
      });
    
    if (upsertError) {
      console.error('Error saving progress:', upsertError);
      return NextResponse.json({ error: 'Failed to save progress' }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      is_completed: shouldComplete,
      progress_percent: shouldComplete ? 100 : calculatedPercent,
    });
  } catch (err: any) {
    console.error('API error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

// GET: Get course progress
export async function GET(
  request: Request,
  { params }: { params: Promise<{ stage: string }> }
) {
  try {
    const { stage } = await params;
    
    // Validate stage
    if (!isStageKey(stage)) {
      return NextResponse.json({ error: 'Invalid stage' }, { status: 400 });
    }

    const stageKey = stage as StageKey;
    
    // Require authentication
    const user = await requireAuth();
    
    // Get course_id from query params
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('course_id');
    
    const supabase = await createServerSupabase();
    
    if (courseId) {
      // Get specific course progress
      const { data: progress, error } = await supabase
        .from('course_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .eq('stage', stageKey)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
        return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
      }
      
      return NextResponse.json({ 
        progress: progress || { 
          last_position: 0, 
          progress_percent: 0, 
          is_completed: false 
        },
      });
    } else {
      // Get all progress for this stage
      const { data: progressList, error } = await supabase
        .from('course_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('stage', stageKey)
        .order('updated_at', { ascending: false });
      
      if (error) {
        return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
      }
      
      return NextResponse.json({ 
        progress: progressList || [],
      });
    }
  } catch (err: any) {
    console.error('API error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
