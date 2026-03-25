'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { allStages } from '@/lib/content/stages';
import { useScrollPosition } from '@/lib/hooks/useScrollPosition';
import { isDemoMode } from '@/lib/supabase';
import { UserMenu } from '@/components/auth/UserMenu';

interface AppShellProps {
  children: ReactNode;
  user?: {
    email: string;
    role: 'student' | 'teacher' | 'admin';
    stage?: string | null;
  } | null;
}

export function AppShell({ children, user }: AppShellProps) {
  const { scrolled } = useScrollPosition(50);

  return (
    <div className="min-h-screen bg-apple-bg-secondary">
      <header 
        className={`sticky top-0 z-50 transition-all duration-300 ease-apple ${
          scrolled 
            ? 'border-b border-apple-border/50 bg-white/90 backdrop-blur-xl shadow-apple' 
            : 'bg-white/80 backdrop-blur-md'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link 
            href="/" 
            className="text-sm font-semibold uppercase tracking-[0.2em] text-apple-text hover:text-apple-blue transition-colors duration-200"
          >
            Campus First Aid
          </Link>
          
          <nav className="flex flex-wrap items-center gap-6 text-sm">
            {/* Stage Navigation - visible to all */}
            {allStages.map((entry) => (
              <Link 
                key={entry.stage.key} 
                href={`/stage/${entry.stage.key}`} 
                className="relative text-apple-text hover:text-apple-blue transition-colors duration-200 font-medium group hidden md:block"
              >
                {entry.stage.shortLabel}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-apple-blue transition-all duration-200 ease-apple group-hover:w-full" />
              </Link>
            ))}
            
            {/* Courses Link for Students */}
            {user?.role === 'student' && user?.stage && (
              <Link 
                href={`/stage/${user.stage}/courses`} 
                className="relative text-apple-text hover:text-apple-blue transition-colors duration-200 font-medium group hidden md:block"
              >
                Courses
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-apple-blue transition-all duration-200 ease-apple group-hover:w-full" />
              </Link>
            )}
            
            {/* Teacher Dashboard Link */}
            {(user?.role === 'teacher' || user?.role === 'admin') && (
              <Link 
                href="/teacher" 
                className="rounded-full border border-apple-blue px-4 py-1.5 text-apple-blue 
                           transition-all duration-200 ease-apple font-medium
                           hover:bg-apple-blue hover:text-white hover:-translate-y-0.5 hover:shadow-md
                           active:scale-[0.98] active:shadow-none active:brightness-[0.97]"
              >
                Teacher Dashboard
              </Link>
            )}
            
            {/* Admin Link */}
            {user?.role === 'admin' && (
              <Link 
                href="/admin" 
                className="rounded-full border border-apple-red px-4 py-1.5 text-apple-red 
                           transition-all duration-200 ease-apple font-medium
                           hover:bg-apple-red hover:text-white hover:-translate-y-0.5 hover:shadow-md
                           active:scale-[0.98] active:shadow-none active:brightness-[0.97]"
              >
                Admin
              </Link>
            )}
            
            {/* User Menu */}
            {user ? (
              <UserMenu user={user} />
            ) : !isDemoMode ? (
              <Link 
                href="/login"
                className="rounded-full bg-apple-blue px-4 py-1.5 text-white font-medium
                           transition-all duration-200 ease-apple
                           hover:bg-apple-blue-hover hover:-translate-y-0.5 hover:shadow-md
                           active:scale-[0.98] active:shadow-none"
              >
                Sign In
              </Link>
            ) : null}
          </nav>
        </div>
      </header>
      
      <main className="mx-auto max-w-7xl px-6 py-12">
        {children}
      </main>
    </div>
  );
}
