import { useEffect, useState, type ReactNode } from 'react';
import { Menu, Search, ShoppingCart, User } from 'lucide-react';
import { navItems, type NavId } from '../../config/site';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';
import { cn } from '../../lib/utils';
import { Logo } from '../ui/Logo';

export function useNavAction() {
  const { goHome, goShop } = useStore();
  return (id: NavId) => {
    switch (id) {
      case 'home':
        return goHome('top');
      case 'shop':
        return goShop();
      case 'deals':
        return goShop({ deals: true });
      default:
        return goHome(id);
    }
  };
}

export function Header() {
  const { view, open, goShop, goHome, user } = useStore();
  const { count } = useCart();
  const onNav = useNavAction();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (id: NavId) =>
    (id === 'home' && view.name === 'home') ||
    (id === 'shop' && view.name === 'shop' && !view.deals) ||
    (id === 'deals' && view.name === 'shop' && view.deals);

  return (
    <header
      className={cn(
        'sticky top-0 z-30 border-b transition-colors duration-300',
        scrolled ? 'border-white/10 bg-ink/95 backdrop-blur-md' : 'border-white/[0.06] bg-ink',
      )}
    >
      <div className="container-x flex h-16 items-center justify-between gap-4 lg:h-[78px]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => open('menu')}
            className="-ml-2 grid h-10 w-10 place-items-center rounded-lg text-white transition hover:text-brand lg:hidden"
            aria-label="Abrir menu"
          >
            <Menu size={22} />
          </button>
          <Logo onClick={() => goHome('top')} />
        </div>

        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-9">
            {navItems.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNav(item.id);
                  }}
                  className={cn(
                    'relative py-2 text-sm font-medium transition hover:text-brand',
                    isActive(item.id) ? 'text-white' : 'text-white/90',
                  )}
                >
                  {item.label}
                  <span
                    className={cn(
                      'absolute -bottom-1.5 left-0 h-0.5 rounded-full bg-brand transition-all duration-300',
                      isActive(item.id) ? 'w-full' : 'w-0',
                    )}
                  />
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <IconButton label="Buscar produtos" onClick={() => open('search')}>
            <Search size={21} />
          </IconButton>
          <IconButton label={user ? 'Minha conta' : 'Entrar'} onClick={() => open('account')} className="hidden sm:grid">
            <User size={21} />
            {user && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-ink" />}
          </IconButton>
          <IconButton label={`Carrinho, ${count} itens`} onClick={() => open('cart')}>
            <ShoppingCart size={21} />
            <span
              key={count}
              className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] animate-pop-in place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-ink"
            >
              {count}
            </span>
          </IconButton>
          <button type="button" onClick={() => goShop()} className="btn-primary ml-3 hidden px-5 py-2.5 md:inline-flex">
            Comprar
          </button>
        </div>
      </div>
    </header>
  );
}

function IconButton({
  label,
  onClick,
  children,
  className,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn('relative grid h-10 w-10 place-items-center rounded-lg text-white transition hover:text-brand', className)}
    >
      {children}
    </button>
  );
}
