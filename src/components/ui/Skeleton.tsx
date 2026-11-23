import { cn } from '../../lib/utils';

/** Cartões "fantasma" enquanto os produtos carregam. */
export function ProductSkeletons({ count = 6, className, itemClassName }: { count?: number; className?: string; itemClassName?: string }) {
  return (
    <ul className={className} aria-busy="true" aria-label="Carregando produtos">
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className={cn('rounded-xl border border-line bg-white p-2.5', itemClassName)}>
          <div className="aspect-square animate-pulse rounded-lg bg-surface" />
          <div className="mt-3 h-2.5 w-1/3 animate-pulse rounded bg-surface" />
          <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-surface" />
          <div className="mt-1.5 h-3 w-1/2 animate-pulse rounded bg-surface" />
          <div className="mt-4 h-4 w-2/5 animate-pulse rounded bg-surface" />
        </li>
      ))}
    </ul>
  );
}
