import { Star } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Stars({ rating, size = 12, className }: { rating: number; size?: number; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-0.5', className)} aria-label={`${rating} de 5 estrelas`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const filled = rating >= i + 0.75;
        const half = !filled && rating >= i + 0.25;
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <Star size={size} strokeWidth={1.5} className="absolute inset-0 text-brand/35" />
            {(filled || half) && (
              <span className="absolute inset-0 overflow-hidden" style={{ width: filled ? size : size / 2 }}>
                <Star size={size} strokeWidth={1.5} className="text-brand" fill="currentColor" />
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}
