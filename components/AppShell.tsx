import Link from 'next/link';
import { ReactNode } from 'react';
import { allStages } from '@/lib/content/stages';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-white/10 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-300">
            Campus First Aid
          </Link>
          <nav className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
            {allStages.map((entry) => (
              <Link key={entry.stage.key} href={`/stage/${entry.stage.key}`} className="hover:text-white">
                {entry.stage.shortLabel}
              </Link>
            ))}
            <Link href="/teacher" className="rounded-full border border-sky-400/30 px-3 py-1 text-sky-200 hover:bg-sky-400/10">
              Teacher Dashboard
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
    </div>
  );
}
