import { cn } from '../../lib/utils';

/** Destaque manuscrito com sublinhado verde. */
export function ScriptNote({ lines, className }: { lines: string[]; className?: string }) {
  return (
    <div className={cn('pointer-events-none select-none font-script leading-[1.05] text-white', className)} aria-hidden="true">
      {lines.map((l, i) => (
        <span key={i} className="block" style={{ paddingLeft: `${i * 0.6}em` }}>
          {l}
        </span>
      ))}
      <svg viewBox="0 0 120 14" className="mt-1 ml-[0.8em] h-3 w-[78%]" fill="none">
        <path d="M2 10 C 30 2, 70 2, 118 6" stroke="var(--color-brand)" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  );
}
