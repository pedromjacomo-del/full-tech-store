import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

/** Dimmed backdrop + click-outside to close. */
export function Backdrop({ onClose, className }: { onClose: () => void; className?: string }) {
  return (
    <div
      className={cn('fixed inset-0 z-40 animate-fade-in bg-ink/70 backdrop-blur-[2px]', className)}
      onClick={onClose}
      aria-hidden="true"
    />
  );
}

export function CloseButton({ onClick, className, label = 'Fechar' }: { onClick: () => void; className?: string; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn('grid h-9 w-9 place-items-center rounded-full text-current transition hover:bg-black/5 hover:text-brand-deep', className)}
    >
      <X size={20} />
    </button>
  );
}

export function Modal({
  onClose,
  children,
  className,
  label,
}: {
  onClose: () => void;
  children: ReactNode;
  className?: string;
  label: string;
}) {
  return (
    <>
      <Backdrop onClose={onClose} />
      <div className="pointer-events-none fixed inset-0 z-50 grid items-end justify-items-center sm:place-items-center sm:p-6">
        <div
          role="dialog"
          aria-modal="true"
          aria-label={label}
          className={cn(
            'pointer-events-auto relative max-h-[92dvh] w-full animate-pop-in overflow-y-auto overscroll-contain rounded-t-2xl bg-white pb-[env(safe-area-inset-bottom)] shadow-2xl sm:max-h-[calc(100dvh-48px)] sm:rounded-2xl sm:pb-0',
            className,
          )}
        >
          {children}
        </div>
      </div>
    </>
  );
}
