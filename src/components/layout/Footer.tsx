import { Clock, CreditCard, Instagram, MapPin, MessageCircle } from 'lucide-react';
import { contactLink, site } from '../../config/site';
import { useStore } from '../../context/StoreContext';
import { useCatalog } from '../../context/CatalogContext';
import { Logo } from '../ui/Logo';

export function Footer() {
  const { goShop, goHome, open } = useStore();
  const { categories } = useCatalog();
  const year = new Date().getFullYear();
  const linkCls = 'text-sm text-white/60 transition hover:text-brand';

  return (
    <footer className="bg-ink text-white">
      <div className="container-x grid grid-cols-2 gap-x-6 gap-y-9 py-10 sm:gap-10 sm:py-14 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
        <div id="about" className="col-span-2 scroll-mt-28 lg:col-span-1">
          <Logo onClick={() => goHome('top')} />
          <h3 className="mt-6 text-sm font-semibold uppercase tracking-wider text-brand">Sobre a loja</h3>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/60">
            A {site.name} é uma loja de iPhones e acessórios para celular no {site.location}. Mais de 20 mil histórias
            conectadas.
          </p>
          <a
            href={site.instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 py-2 pl-2 pr-4 text-sm text-white/80 transition hover:border-brand hover:text-brand"
          >
            <span className="grid h-7 w-7 place-items-center rounded-full bg-brand text-ink">
              <Instagram size={15} />
            </span>
            @{site.instagramHandle}
          </a>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider">Loja</h3>
          <ul className="mt-4 space-y-2.5">
            {categories.map((c) => (
              <li key={c.slug}>
                <button type="button" className={linkCls} onClick={() => goShop({ category: c.slug })}>
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider">Ajuda</h3>
          <ul className="mt-4 space-y-2.5">
            <li><button type="button" className={linkCls} onClick={() => goShop({ deals: true })}>Ofertas</button></li>
            <li><button type="button" className={linkCls} onClick={() => open('cart')}>Meu carrinho</button></li>
            <li><button type="button" className={linkCls} onClick={() => open('account')}>Minha conta</button></li>
            <li><a className={linkCls} href={contactLink('Olá, Full Tech Store! Vim pelo site.')} target="_blank" rel="noreferrer">Falar com a loja</a></li>
          </ul>
        </div>

        <div id="contact" className="col-span-2 scroll-mt-28 lg:col-span-1">
          <h3 className="text-sm font-semibold uppercase tracking-wider">Contato</h3>
          <ul className="mt-4 space-y-3 text-sm text-white/60">
            <li className="flex gap-3"><MapPin size={17} className="mt-0.5 shrink-0 text-brand" />{site.location}</li>
            <li className="flex gap-3"><Clock size={17} className="mt-0.5 shrink-0 text-brand" />{site.hours}</li>
            <li className="flex gap-3">
              <Instagram size={17} className="mt-0.5 shrink-0 text-brand" />
              <a href={site.instagramUrl} target="_blank" rel="noreferrer" className="hover:text-brand">@{site.instagramHandle}</a>
            </li>
            <li className="flex gap-3">
              <MessageCircle size={17} className="mt-0.5 shrink-0 text-brand" />
              <a href={contactLink('Olá, Full Tech Store! Vim pelo site.')} target="_blank" rel="noreferrer" className="hover:text-brand">WhatsApp {site.whatsappDisplay}</a>
            </li>
            <li className="flex gap-3"><CreditCard size={17} className="mt-0.5 shrink-0 text-brand" />{site.payments.join(' · ')}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-1 py-5 pb-24 text-center text-xs text-white/45 sm:flex-row sm:pb-5">
          <p>© {year} {site.name}. Todos os direitos reservados.</p>
          <p>
            {site.tagline} · <a href="#admin" className="transition hover:text-brand">Área da loja</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
