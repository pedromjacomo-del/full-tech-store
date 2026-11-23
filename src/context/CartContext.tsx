import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import type { Product } from '../data/products';
import { isPurchasable, useCatalog } from './CatalogContext';
import { storage } from '../lib/utils';

interface CartLine {
  id: string;
  qty: number;
}

type Action =
  | { type: 'add'; id: string; qty: number }
  | { type: 'set'; id: string; qty: number }
  | { type: 'remove'; id: string }
  | { type: 'clear' };

const STORAGE_KEY = 'fulltech-cart';
const MAX_QTY = 20;

function reducer(state: CartLine[], action: Action): CartLine[] {
  switch (action.type) {
    case 'add': {
      const line = state.find((l) => l.id === action.id);
      if (line) return state.map((l) => (l.id === action.id ? { ...l, qty: Math.min(MAX_QTY, l.qty + action.qty) } : l));
      return [...state, { id: action.id, qty: Math.min(MAX_QTY, action.qty) }];
    }
    case 'set':
      if (action.qty <= 0) return state.filter((l) => l.id !== action.id);
      return state.map((l) => (l.id === action.id ? { ...l, qty: Math.min(MAX_QTY, action.qty) } : l));
    case 'remove':
      return state.filter((l) => l.id !== action.id);
    case 'clear':
      return [];
  }
}

interface CartValue {
  items: { product: Product; qty: number }[];
  count: number;
  total: number;
  add: (id: string, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { productById, loading } = useCatalog();
  const [lines, dispatch] = useReducer(reducer, [], () => storage.get<CartLine[]>(STORAGE_KEY, []));

  useEffect(() => storage.set(STORAGE_KEY, lines), [lines]);

  const value = useMemo<CartValue>(() => {
    // Itens que saíram do catálogo ou esgotaram não entram no total.
    const items = lines
      .map((l) => ({ product: productById(l.id), qty: l.qty }))
      .filter((i): i is { product: Product; qty: number } => isPurchasable(i.product));
    const total = items.reduce((s, i) => s + (i.product.price ?? 0) * i.qty, 0);
    const count = items.reduce((s, i) => s + i.qty, 0);
    return {
      items,
      count,
      total,
      add: (id, qty = 1) => {
        if (isPurchasable(productById(id))) dispatch({ type: 'add', id, qty });
      },
      setQty: (id, qty) => dispatch({ type: 'set', id, qty }),
      remove: (id) => dispatch({ type: 'remove', id }),
      clear: () => dispatch({ type: 'clear' }),
    };
  }, [lines, productById]);

  // Remove do carrinho salvo o que não existe mais (depois que o catálogo carregou).
  useEffect(() => {
    if (loading) return;
    lines.forEach((l) => {
      if (!isPurchasable(productById(l.id))) dispatch({ type: 'remove', id: l.id });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart precisa estar dentro de <CartProvider>');
  return ctx;
}
