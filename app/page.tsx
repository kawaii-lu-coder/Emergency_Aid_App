import Link from 'next/link';
import { StageCard } from '@/components/StageCard';
import { SectionCard } from '@/components/SectionCard';
import { allStages } from '@/lib/content/stages';
import { supabaseMode } from '@/lib/supabase';

export default function HomePage() {
  return (
    <div className="space-y-8">
      <SectionCard className="overflow-hidden bg-gradient-to-br from-sky-400/20 via-slate-900/70 to-emerald-400/10">
        <div className="grid gap-8 lg:grid-cols-[1.35fr,0.65fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-sky-200/80">Competition demo · shared platform</p>
            <h1 className="mt-4 max-w-4xl text-5xl font-semibold leading-tight text-white">
              One first-aid learning platform, three stage-specific closed loops.
            </h1>
            <p className="mt-4 max-w-3xl text-lg text-slate-200">
              Explore a shared app shell that adapts lesson content, quiz logic, scenario depth, and feedback tone for primary, middle, and high school learners.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/stage/primary" className="rounded-full bg-sky-400 px-5 py-3 font-medium text-slate-950 hover:bg-sky-300">
                Start learner loop
              </Link>
              <Link href="/teacher" className="rounded-full border border-white/15 px-5 py-3 text-white hover:bg-white/5">
                Open teacher dashboard
              </Link>
            </div>
          </div>
          <SectionCard className="bg-slate-950/60">
            <h2 className="text-xl font-semibold text-white">What this demo proves</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-200">
              <li>• Shared app shell and design system</li>
              <li>• Stage-specific lesson, quiz, scenario, and result content</li>
              <li>• Lightweight Next.js backend with optional Supabase connection</li>
              <li>• Stage-comparison analytics for teachers</li>
            </ul>
            <p className="mt-5 text-xs uppercase tracking-[0.28em] text-slate-400">Persistence mode: {supabaseMode}</p>
          </SectionCard>
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-3">
        {allStages.map((content) => (
          <StageCard key={content.stage.key} content={content} />
        ))}
      </div>
    </div>
  );
}
