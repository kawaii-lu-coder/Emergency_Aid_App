import { ReactNode } from 'react';
import { classNames } from '@/lib/utils/classNames';

export function SectionCard({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={classNames('rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft', className)}>{children}</div>;
}
