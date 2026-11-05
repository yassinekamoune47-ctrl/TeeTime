import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  tone?: 'light' | 'dark';
  action?: ReactNode;
}

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  tone = 'light',
  action,
}: SectionHeadingProps) {
  const isDark = tone === 'dark';

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <p className={cn('flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.32em]', isDark ? 'text-primary' : 'text-primary-hover')}>
          <span className="h-px w-8 bg-current opacity-60" />
          {eyebrow}
        </p>
        <h2 className={cn('mt-4 font-serif text-3xl font-bold leading-tight md:text-[40px]', isDark ? 'text-white' : 'text-secondary')}>
          {title}
        </h2>
        {subtitle && (
          <p className={cn('mt-3 text-sm leading-relaxed md:text-base', isDark ? 'text-white/65' : 'text-muted-foreground')}>
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
