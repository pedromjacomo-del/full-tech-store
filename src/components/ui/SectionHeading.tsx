import { cn } from '../../lib/utils';

/** Centered title flanked by orange lines — "Shop by Category" style. */
export function SectionHeading({ title, subtitle, className }: { title: string; subtitle?: string; className?: string }) {
  return (
    <div className={cn('text-center', className)}>
      <div className="flex items-center justify-center gap-4">
        <span className="h-0.5 w-6 rounded-full bg-gradient-to-r from-transparent to-brand sm:w-14" />
        <h2 className="font-display text-[21px] font-bold tracking-tight text-ink min-[400px]:text-2xl sm:text-[28px]">{title}</h2>
        <span className="h-0.5 w-6 rounded-full bg-gradient-to-l from-transparent to-brand sm:w-14" />
      </div>
      {subtitle && <p className="mt-1.5 text-[13px] text-ink/55 sm:text-sm">{subtitle}</p>}
    </div>
  );
}
