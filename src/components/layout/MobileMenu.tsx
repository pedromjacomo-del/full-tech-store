import { ChevronRight, Clock, Instagram, MapPin, User } from 'lucide-react';
import { navItems, site } from '../../config/site';
import { useStore } from '../../context/StoreContext';
import { Backdrop, CloseButton } from '../ui/Overlay';
import { Logo } from '../ui/Logo';
import { useNavAction } from './Header';

export function MobileMenu() {
  const { close, goShop, goHome, open } = useStore();
  const onNav = useNavAction();
  return (
    <>
      <Backdrop onClose={close} />
      <aside
        className="fixed inset-y-0 left-0 z-50 flex w-[86%] max-w-sm animate-slide-in-left flex-col bg-ink text-white shadow-2xl"
        aria-label="Menu"
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <Logo onClick={() => goHome('top')} />
          <CloseButton onClick={close} className="hover:bg-white/10" />
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onNav(item.id)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-3.5 text-left text-[15px] font-medium transition hover:bg-white/5 hover:text-brand"
            >
              {item.label}
              <ChevronRight size={18} className="text-white/30" />
            </button>
          ))}
          <button
            type="button"
            onClick={() => open('account')}
            className="mt-2 flex w-full items-center gap-3 rounded-lg border border-white/10 px-3 py-3.5 text-left text-[15px] font-medium transition hover:border-brand/50"
          >
            <User size={18} className="text-brand" /> Minha conta
          </button>
        </nav>
        <div className="space-y-4 border-t border-white/10 p-5">
          <button type="button" onClick={() => goShop()} className="btn-primary w-full py-3.5">
            Comprar agora
          </button>
          <div className="space-y-2 text-sm text-white/60">
            <a href={site.instagramUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-brand"><Instagram size={15} className="text-brand" /> @{site.instagramHandle}</a>
            <p className="flex items-center gap-2"><MapPin size={15} className="text-brand" /> {site.location}</p>
            <p className="flex items-center gap-2"><Clock size={15} className="text-brand" /> {site.hours}</p>
          </div>
        </div>
      </aside>
    </>
  );
}
