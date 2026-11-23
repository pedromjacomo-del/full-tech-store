import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { CircleCheck, Info, LoaderCircle, TriangleAlert, X } from 'lucide-react';
import { cn } from '../lib/utils';
import type { ProductStatus } from '../data/products';

/* ---------- utilidades ---------- */

export const slugify = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);

/** "1.299,90" | "1299.90" | "1299" → 1299.9  ·  vazio → null */
export function parsePrice(input: string): number | null | 'invalid' {
  const raw = input.trim().replace(/^R\$\s*/i, '');
  if (!raw) return null;
  const normalized = raw.includes(',') ? raw.replace(/\./g, '').replace(',', '.') : raw;
  const n = Number(normalized);
  if (!Number.isFinite(n) || n < 0) return 'invalid';
  return Math.round(n * 100) / 100;
}

export const priceToInput = (n: number | null | undefined) =>
  n === null || n === undefined ? '' : n.toFixed(2).replace('.', ',');

/* ---------- peças visuais ---------- */

export function Spinner({ className, size = 18 }: { className?: string; size?: number }) {
  return <LoaderCircle size={size} className={cn('animate-spin', className)} aria-hidden="true" />;
}

export function FullScreenSpinner({ label = 'Carregando…' }: { label?: string }) {
  return (
    <div className="grid min-h-dvh place-items-center bg-surface text-sm text-ink/55">
      <span className="flex items-center gap-2">
        <Spinner /> {label}
      </span>
    </div>
  );
}

export function Field({
  label,
  hint,
  error,
  required,
  children,
  className,
}: {
  label: string;
  hint?: ReactNode;
  error?: string | null;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-1.5 block text-[13px] font-semibold text-ink/80">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {children}
      {error ? (
        <span className="mt-1 block text-xs font-medium text-red-600">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-ink/50">{hint}</span>
      ) : null}
    </label>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-xl border border-line bg-white px-4 py-3 text-left transition hover:border-ink/20"
    >
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-ink/55">{description}</span>}
      </span>
      <span className={cn('relative h-6 w-11 shrink-0 rounded-full transition', checked ? 'bg-brand-deep' : 'bg-ink/15')}>
        <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all', checked ? 'left-[22px]' : 'left-0.5')} />
      </span>
    </button>
  );
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; hint?: string }[];
}) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            'rounded-xl border px-2 py-2.5 text-center transition',
            value === o.value ? 'border-brand-deep bg-brand/15 text-ink' : 'border-line bg-white text-ink/60 hover:border-ink/25',
          )}
        >
          <span className="block text-sm font-semibold">{o.label}</span>
          {o.hint && <span className="mt-0.5 block text-[11px] leading-tight text-ink/50">{o.hint}</span>}
        </button>
      ))}
    </div>
  );
}

const STATUS_STYLE: Record<ProductStatus, string> = {
  ativo: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  esgotado: 'bg-amber-50 text-amber-700 ring-amber-200',
  oculto: 'bg-ink/5 text-ink/55 ring-ink/10',
};
export const STATUS_LABEL: Record<ProductStatus, string> = { ativo: 'À venda', esgotado: 'Esgotado', oculto: 'Oculto' };

export function StatusPill({ status }: { status: ProductStatus }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1', STATUS_STYLE[status])}>
      {STATUS_LABEL[status]}
    </span>
  );
}

/** Painel lateral (tela cheia no celular). */
export function Sheet({
  title,
  onClose,
  children,
  footer,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.documentElement.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <>
      <div className="fixed inset-0 z-40 animate-fade-in bg-ink/60" onClick={onClose} aria-hidden="true" />
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="fixed inset-0 z-50 flex animate-slide-in-right flex-col bg-surface sm:inset-y-0 sm:left-auto sm:right-0 sm:w-full sm:max-w-xl sm:shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-line bg-white px-4 py-3 sm:px-6">
          <h2 className="font-display text-lg font-bold">{title}</h2>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full hover:bg-surface" aria-label="Fechar">
            <X size={20} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">{children}</div>
        {footer && (
          <footer className="border-t border-line bg-white px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6">{footer}</footer>
        )}
      </section>
    </>
  );
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirmar',
  danger,
  busy,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-[60] animate-fade-in bg-ink/60" onClick={onCancel} aria-hidden="true" />
      <div className="fixed inset-0 z-[61] grid place-items-center p-4" role="alertdialog" aria-modal="true" aria-label={title}>
        <div className="w-full max-w-sm animate-pop-in rounded-2xl bg-white p-6 shadow-2xl">
          <span className={cn('grid h-11 w-11 place-items-center rounded-full', danger ? 'bg-red-50 text-red-600' : 'bg-brand/15 text-brand-deep')}>
            <TriangleAlert size={22} />
          </span>
          <h3 className="mt-4 font-display text-lg font-bold">{title}</h3>
          <div className="mt-1.5 text-sm text-ink/65">{message}</div>
          <div className="mt-6 grid grid-cols-2 gap-2">
            <button type="button" onClick={onCancel} className="rounded-lg border border-line py-2.5 text-sm font-semibold transition hover:bg-surface">
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={busy}
              className={cn(
                'inline-flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold transition disabled:opacity-60',
                danger ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-brand text-ink hover:bg-brand-2',
              )}
            >
              {busy && <Spinner size={16} />} {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------- avisos ---------- */

export type Notice = { id: number; kind: 'ok' | 'error' | 'info'; text: string };

export function useNotices() {
  const [notice, setNotice] = useState<Notice | null>(null);
  const notify = useCallback((text: string, kind: Notice['kind'] = 'ok') => setNotice({ id: Date.now(), kind, text }), []);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), notice.kind === 'error' ? 6000 : 2800);
    return () => clearTimeout(t);
  }, [notice]);
  return { notice, notify, dismiss: () => setNotice(null) };
}

export function NoticeToast({ notice, onClose }: { notice: Notice | null; onClose: () => void }) {
  if (!notice) return null;
  const Icon = notice.kind === 'error' ? TriangleAlert : notice.kind === 'info' ? Info : CircleCheck;
  return (
    <div
      key={notice.id}
      role="status"
      className={cn(
        'fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-[70] flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 animate-toast-in items-start gap-3 rounded-xl px-4 py-3 text-sm shadow-2xl',
        notice.kind === 'error' ? 'bg-red-600 text-white' : 'bg-ink text-white',
      )}
    >
      <Icon size={18} className={cn('mt-px shrink-0', notice.kind === 'error' ? 'text-white' : 'text-brand')} />
      <span className="flex-1">{notice.text}</span>
      <button type="button" onClick={onClose} aria-label="Fechar aviso" className="opacity-70 hover:opacity-100">
        <X size={16} />
      </button>
    </div>
  );
}
