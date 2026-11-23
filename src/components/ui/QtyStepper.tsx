import { Minus, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';

export function QtyStepper({
  value,
  onChange,
  min = 1,
  max = 20,
  size = 'md',
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md';
}) {
  const btn = cn(
    'grid place-items-center text-ink/70 transition hover:bg-surface hover:text-brand-deep disabled:opacity-30 disabled:hover:bg-transparent',
    size === 'sm' ? 'h-7 w-7' : 'h-10 w-10',
  );
  return (
    <div className="inline-flex items-center rounded-lg border border-line bg-white">
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Diminuir quantidade">
        <Minus size={size === 'sm' ? 13 : 16} />
      </button>
      <span className={cn('min-w-7 text-center font-semibold tabular-nums', size === 'sm' ? 'text-xs' : 'text-sm')} aria-live="polite">
        {value}
      </span>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Aumentar quantidade">
        <Plus size={size === 'sm' ? 13 : 16} />
      </button>
    </div>
  );
}
