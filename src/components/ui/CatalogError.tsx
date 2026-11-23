import { MessageCircle } from 'lucide-react';
import { contactLink, site } from '../../config/site';

export function CatalogError() {
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-line bg-white px-6 py-12 text-center">
      <p className="font-display text-lg font-bold">Não conseguimos carregar os produtos agora</p>
      <p className="mt-1 text-sm text-ink/55">Tente de novo em instantes ou fale direto com a loja.</p>
      <a href={contactLink(`Olá, ${site.name}! Vim pelo site.`)} target="_blank" rel="noreferrer" className="btn-primary mt-5">
        <MessageCircle size={17} /> Falar no WhatsApp
      </a>
    </div>
  );
}
