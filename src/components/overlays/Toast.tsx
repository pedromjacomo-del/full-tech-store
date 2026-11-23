import { CircleCheck } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export function Toast() {
  const { toast, open } = useStore();
  if (!toast) return null;
  return (
    <div
      key={toast.id}
      role="status"
      className="fixed bottom-24 left-1/2 z-[60] sm:bottom-6 flex -translate-x-1/2 animate-toast-in items-center gap-3 rounded-full bg-ink py-2.5 pl-4 pr-2.5 text-sm text-white shadow-2xl"
    >
      <CircleCheck size={18} className="shrink-0 text-brand" />
      <span className="max-w-[56vw] truncate">{toast.message}</span>
      {toast.message.includes('carrinho') && (
        <button type="button" onClick={() => open('cart')} className="rounded-full bg-brand px-3 py-1 text-xs font-bold text-ink transition hover:bg-brand-2">
          Ver carrinho
        </button>
      )}
    </div>
  );
}
