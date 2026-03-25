-- Campus First Aid Course System Migration
-- Creates courses and course_progress tables with RLS

-- 1. Courses Table (aligned with existing stage system)
create table if not exists public.courses (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  stage text not null check (stage in ('primary', 'middle', 'high')),
  type text not null check (type in ('video', 'ppt')),
  content_url text not null, -- Video URL or PPT JSON array
  thumbnail_url text,
  duration int not null, -- Seconds (video) or page count (PPT)
  order_index int default 0,
  created_at timestamptz default now(),
  published boolean default true
);

-- 2. Course Progress Table (extends learning_records)
create table if not exists public.course_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  stage text not null check (stage in ('primary', 'middle', 'high')),
  last_position float default 0, -- Video seconds or PPT page number
  progress_percent int default 0 check (progress_percent between 0 and 100),
  is_completed boolean default false,
  completed_at timestamptz,
  updated_at timestamptz default now(),
  unique(user_id, course_id)
);

-- 3. Indexes (consistent with existing query patterns)
create index if not exists idx_courses_stage_published on public.courses(stage, published, order_index);
create index if not exists idx_progress_user_course on public.course_progress(user_id, course_id);
create index if not exists idx_progress_user_updated on public.course_progress(user_id, updated_at desc);

-- 4. Enable RLS
alter table public.courses enable row level security;
alter table public.course_progress enable row level security;

-- 5. RLS Policies (consistent with existing style)

-- Courses: Anyone can view published courses
create policy "View published courses" on public.courses
  for select using (published = true);

-- Admin can manage all courses
create policy "Admin full access on courses" on public.courses
  for all using (public.is_admin());

-- Course Progress: Users manage their own progress
create policy "Manage own course progress" on public.course_progress
  for all using (auth.uid() = user_id);

-- Teachers can view their students' progress
create policy "Teachers can view class progress" on public.course_progress
  for select using (
    auth.uid() in (
      select c.teacher_id from public.classes c
      join public.class_students cs on cs.class_id = c.id
      where cs.student_id = course_progress.user_id
    )
  );

-- Admin can view all progress
create policy "Admin full access on course_progress" on public.course_progress
  for all using (public.is_admin());

-- 6. Trigger: Update timestamps on course_progress
create or replace function public.handle_course_progress_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists handle_course_progress_updated_at on public.course_progress;
create trigger handle_course_progress_updated_at
  before update on public.course_progress
  for each row execute procedure public.handle_course_progress_updated_at();

-- 7. Demo Data (Primary stage, matching existing test accounts)
insert into public.courses (id, title, description, stage, type, content_url, thumbnail_url, duration, order_index) values
('11111111-1111-1111-1111-111111111111', 
 '基础急救：止血与包扎',
 '学习如何正确处理伤口，适合小学生的互动急救课程。通过生动有趣的动画和实操演示，让孩子们掌握基本的急救技能。',
 'primary',
 'video',
 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
 'https://picsum.photos/seed/firstaid001/800/450',
 300,
 1),
('22222222-2222-2222-2222-222222222222',
 '心肺复苏术基础',
 '了解心肺复苏的基本步骤，学习如何在紧急情况下正确呼救并协助成人进行急救。',
 'primary',
 'video',
 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
 'https://picsum.photos/seed/firstaid002/800/450',
 600,
 2),
('33333333-3333-3333-3333-333333333333',
 '日常安全小课堂',
 '通过互动PPT学习日常生活中的安全常识，包括交通安全、食品安全和校园安全。',
 'primary',
 'ppt',
 '["https://picsum.photos/seed/ppt1/800/450", "https://picsum.photos/seed/ppt2/800/450", "https://picsum.photos/seed/ppt3/800/450", "https://picsum.photos/seed/ppt4/800/450", "https://picsum.photos/seed/ppt5/800/450"]',
 'https://picsum.photos/seed/firstaid003/800/450',
 5,
 3)
-- Middle school courses
,('44444444-4444-4444-4444-444444444444',
 '创伤急救进阶',
 '深入学习各类创伤的处理方法，包括骨折固定、烧伤处理和特殊伤口包扎技术。',
 'middle',
 'video',
 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
 'https://picsum.photos/seed/firstaid004/800/450',
 900,
 1)
-- High school courses
,('55555555-5555-5555-5555-555555555555',
 '专业急救技能',
 '学习AED使用、海姆立克急救法等高级急救技能，为成为急救志愿者做准备。',
 'high',
 'video',
 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
 'https://picsum.photos/seed/firstaid005/800/450',
 1200,
 1)
on conflict (id) do nothing;
