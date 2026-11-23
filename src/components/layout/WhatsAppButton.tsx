import { MessageCircle } from 'lucide-react';
import { contactLink, site } from '../../config/site';
import { useStore } from '../../context/StoreContext';

/** Botão flutuante de atendimento (escondido quando há um painel aberto). */
export function WhatsAppButton() {
  const { overlay, productId } = useStore();
  if (overlay || productId) return null;
  return (
    <a
      href={contactLink(`Olá, ${site.name}! Vim pelo site.`)}
      target="_blank"
      rel="noreferrer"
      aria-label="Falar no WhatsApp"
      className="group fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-30 flex h-14 items-center gap-2 rounded-full bg-brand pr-4 pl-4 text-ink shadow-[0_12px_30px_-8px_rgb(5_5_5/0.45)] ring-4 ring-white/70 transition hover:-translate-y-0.5 hover:bg-brand-2 sm:right-6 sm:bottom-6"
    >
      <MessageCircle size={24} strokeWidth={2.2} />
      <span className="hidden text-sm font-bold sm:inline">WhatsApp</span>
    </a>
  );
}
