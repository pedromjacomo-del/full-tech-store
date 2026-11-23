import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { CategorySlug } from '../data/categories';
import { useCart } from './CartContext';
import { useCatalog } from './CatalogContext';

/**
 * Navigation + overlay state.
 * Views use plain hashes so links can be shared: #shop, #shop-phone-cases, #deals.
 */
export type View =
  | { name: 'home' }
  | { name: 'shop'; category: CategorySlug | 'all'; deals: boolean };

export type Overlay = 'search' | 'cart' | 'video' | 'account' | 'menu' | null;
export type HomeSection = 'top' | 'categories' | 'deals' | 'top-picks' | 'about' | 'contact';

interface StoreValue {
  view: View;
  overlay: Overlay;
  productId: string | null;
  shopQuery: string;
  toast: { id: number; message: string } | null;
  user: string | null;
  goHome: (section?: HomeSection) => void;
  goShop: (opts?: { category?: CategorySlug | 'all'; deals?: boolean; query?: string }) => void;
  setShopQuery: (q: string) => void;
  open: (o: Exclude<Overlay, null>) => void;
  close: () => void;
  openProduct: (id: string) => void;
  closeProduct: () => void;
  addToCart: (id: string, qty?: number) => void;
  notify: (message: string) => void;
  signIn: (email: string) => void;
  signOut: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

function parseHash(): View {
  const h = window.location.hash.replace('#', '');
  if (h === 'shop') return { name: 'shop', category: 'all', deals: false };
  if (h === 'deals') return { name: 'shop', category: 'all', deals: true };
  if (h.startsWith('shop-')) {
    const slug = h.slice(5);
    if (/^[a-z0-9-]+$/.test(slug)) return { name: 'shop', category: slug, deals: false };
  }
  return { name: 'home' };
}

const hashFor = (v: View) =>
  v.name === 'home' ? 'home' : v.deals ? 'deals' : v.category === 'all' ? 'shop' : `shop-${v.category}`;

export function StoreProvider({ children }: { children: ReactNode }) {
  const cart = useCart();
  const { productById } = useCatalog();
  const [view, setView] = useState<View>(parseHash);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [productId, setProductId] = useState<string | null>(null);
  const [shopQuery, setShopQuery] = useState('');
  const [toast, setToast] = useState<StoreValue['toast']>(null);
  const [user, setUser] = useState<string | null>(null);
  const pendingScroll = useRef<HomeSection | 'page-top' | null>(null);

  // Keep view in sync with the address bar (back / forward buttons).
  useEffect(() => {
    const onHash = () => {
      setView(parseHash());
      pendingScroll.current = pendingScroll.current ?? 'page-top';
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Scroll after a view change has rendered.
  useEffect(() => {
    const target = pendingScroll.current;
    if (!target) return;
    pendingScroll.current = null;
    requestAnimationFrame(() => {
      if (target === 'page-top' || target === 'top') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [view]);

  const navigate = useCallback((next: View, scroll: HomeSection | 'page-top') => {
    pendingScroll.current = scroll;
    setOverlay(null);
    setProductId(null);
    const hash = hashFor(next);
    if (window.location.hash.replace('#', '') !== hash) {
      try {
        window.history.pushState(null, '', `#${hash}`);
      } catch {
        /* sandboxed frames may refuse — state still updates */
      }
    }
    setView(next);
  }, []);

  const notify = useCallback((message: string) => {
    setToast({ id: Date.now(), message });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  // Lock page scroll while a panel is open.
  useEffect(() => {
    const locked = overlay !== null || productId !== null;
    document.documentElement.style.overflow = locked ? 'hidden' : '';
  }, [overlay, productId]);

  // Esc closes the top-most layer.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (productId) setProductId(null);
      else setOverlay(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [productId]);

  const value = useMemo<StoreValue>(
    () => ({
      view,
      overlay,
      productId,
      shopQuery,
      toast,
      user,
      goHome: (section = 'top') => navigate({ name: 'home' }, section),
      goShop: (opts = {}) => {
        setShopQuery(opts.query ?? '');
        navigate({ name: 'shop', category: opts.category ?? 'all', deals: opts.deals ?? false }, 'page-top');
      },
      setShopQuery,
      open: (o) => setOverlay(o),
      close: () => setOverlay(null),
      openProduct: (id) => {
        setOverlay(null);
        setProductId(id);
      },
      closeProduct: () => setProductId(null),
      addToCart: (id, qty = 1) => {
        cart.add(id, qty);
        const p = productById(id);
        if (p) notify(`${p.name} adicionado ao carrinho`);
      },
      notify,
      signIn: (email) => {
        setUser(email);
        notify('Bem-vindo(a)! Você entrou na sua conta.');
      },
      signOut: () => {
        setUser(null);
        notify('Você saiu da sua conta.');
      },
    }),
    [view, overlay, productId, shopQuery, toast, user, navigate, cart, notify, productById],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore precisa estar dentro de <StoreProvider>');
  return ctx;
}
