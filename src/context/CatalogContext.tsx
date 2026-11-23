import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Category } from '../data/categories';
import type { Product } from '../data/products';
import { site } from '../config/site';
import { api, sortProducts, type Catalog } from '../lib/api';
import { imageSrc } from '../lib/utils';

interface CatalogValue {
  loading: boolean;
  error: string | null;
  categories: Category[];
  products: Product[];
  featured: Product[];
  heroImage: string;
  promoImage: string;
  productById: (id: string) => Product | undefined;
  categoryBySlug: (slug: string) => Category | undefined;
}

const CatalogContext = createContext<CatalogValue | null>(null);

/** Carrega categorias, produtos e imagens do site (Supabase ou modo demonstração). */
export function CatalogProvider({ children }: { children: ReactNode }) {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    api
      .loadCatalog(false)
      .then((c) => alive && setCatalog(c))
      .catch((e: Error) => alive && setError(e.message || 'Erro ao carregar os produtos.'));
    return () => {
      alive = false;
    };
  }, []);

  const value = useMemo<CatalogValue>(() => {
    const categories = [...(catalog?.categories ?? [])]
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      .map((c) => ({ ...c, image: imageSrc(c.image) }));
    const products = sortProducts(catalog?.products ?? []).map((p) => ({ ...p, image: imageSrc(p.image) }));
    return {
      loading: !catalog && !error,
      error,
      categories,
      products,
      featured: products.filter((p) => p.featured && p.status !== 'esgotado').slice(0, 6),
      heroImage: imageSrc(catalog?.settings.heroImage || site.hero.image),
      promoImage: imageSrc(catalog?.settings.promoImage || site.promo.image),
      productById: (id) => products.find((p) => p.id === id),
      categoryBySlug: (slug) => categories.find((c) => c.slug === slug),
    };
  }, [catalog, error]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error('useCatalog precisa estar dentro de <CatalogProvider>');
  return ctx;
}

/** Produto pode ir para o carrinho? */
export const isPurchasable = (p?: Product) => !!p && p.price !== null && (p.status ?? 'ativo') === 'ativo';
