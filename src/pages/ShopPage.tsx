import { useMemo, useState } from 'react';
import { ChevronRight, Search, SlidersHorizontal, Tag, X } from 'lucide-react';
import { discountOf } from '../data/products';
import { useStore } from '../context/StoreContext';
import { useCatalog } from '../context/CatalogContext';
import { ProductSkeletons } from '../components/ui/Skeleton';
import { cn } from '../lib/utils';
import { ProductCard } from '../components/ui/ProductCard';
import { CatalogError } from '../components/ui/CatalogError';
import { searchProducts } from '../components/overlays/SearchOverlay';

type Sort = 'featured' | 'price-asc' | 'price-desc' | 'discount';

export function ShopPage() {
  const { view, goShop, goHome, shopQuery, setShopQuery } = useStore();
  const [sort, setSort] = useState<Sort>('featured');
  const { products, categories, categoryBySlug, loading, error } = useCatalog();
  const category = view.name === 'shop' ? view.category : 'all';
  const deals = view.name === 'shop' && view.deals;

  const list = useMemo(() => {
    let items = shopQuery.trim() ? searchProducts(products, categories, shopQuery) : [...products];
    if (category !== 'all') items = items.filter((p) => p.category === category);
    if (deals) items = items.filter((p) => discountOf(p) > 0);
    const sorted = [...items];
    const price = (v: number | null, fallback: number) => (v === null ? fallback : v);
    if (sort === 'price-asc') sorted.sort((a, b) => price(a.price, Infinity) - price(b.price, Infinity));
    if (sort === 'price-desc') sorted.sort((a, b) => price(b.price, -1) - price(a.price, -1));
    if (sort === 'discount' || (deals && sort === 'featured')) sorted.sort((a, b) => discountOf(b) - discountOf(a));
    // Esgotados vão para o fim da lista.
    sorted.sort((a, b) => Number(a.status === 'esgotado') - Number(b.status === 'esgotado'));
    return sorted;
  }, [category, deals, shopQuery, sort, products, categories]);

  const title = deals ? 'Ofertas' : category === 'all' ? 'Todos os Produtos' : categoryBySlug(category)?.name ?? 'Loja';
  const countFor = (slug: string) => products.filter((p) => (slug === 'all' || p.category === slug) && (!deals || discountOf(p) > 0)).length;

  if (view.name !== 'shop') return null;

  return (
    <section className="bg-surface pb-10">
      {/* page header */}
      <div className="border-b border-line bg-white">
        <div className="container-x py-5 sm:py-9">
          <nav aria-label="Navegação" className="flex items-center gap-1.5 text-xs text-ink/50">
            <button type="button" onClick={() => goHome('top')} className="hover:text-brand-deep">Início</button>
            <ChevronRight size={13} />
            <button type="button" onClick={() => goShop()} className="hover:text-brand-deep">Loja</button>
            {(category !== 'all' || deals) && (
              <>
                <ChevronRight size={13} />
                <span className="text-ink/80">{deals ? 'Ofertas' : categoryBySlug(category)?.name}</span>
              </>
            )}
          </nav>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-[26px] font-bold tracking-tight sm:text-[34px]">{title}</h1>
              <p className="mt-1 text-sm text-ink/55">
                {list.length} {list.length === 1 ? 'produto' : 'produtos'}
                {shopQuery.trim() && <> para “{shopQuery}”</>}
              </p>
            </div>
            <div className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-2.5 sm:flex sm:w-auto">
              <label className="relative col-span-2 sm:col-span-1 sm:w-64">
                <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
                <input
                  value={shopQuery}
                  onChange={(e) => setShopQuery(e.target.value)}
                  placeholder="Buscar produtos"
                  className="input pl-9"
                  aria-label="Buscar produtos"
                />
              </label>
              <label className="relative">
                <SlidersHorizontal size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as Sort)}
                  className="input appearance-none pl-9 pr-8"
                  aria-label="Ordenar produtos"
                >
                  <option value="featured">Destaques</option>
                  <option value="price-asc">Menor preço</option>
                  <option value="price-desc">Maior preço</option>
                  <option value="discount">Maior desconto</option>
                </select>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="container-x pt-6">
        {/* category filters */}
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          {[{ slug: 'all', name: 'Todos' }, ...categories].map((c) => {
            const active = category === c.slug;
            return (
              <button
                key={c.slug}
                type="button"
                onClick={() => goShop({ category: c.slug as never, deals, query: shopQuery })}
                className={cn(
                  'shrink-0 rounded-full border px-4 py-2 text-[13px] font-medium transition',
                  active ? 'border-brand bg-brand font-semibold text-ink' : 'border-line bg-white text-ink/75 hover:border-brand hover:text-brand-deep',
                )}
              >
                {c.name} <span className={cn('ml-1 text-xs', active ? 'text-ink/60' : 'text-ink/35')}>{countFor(c.slug)}</span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => goShop({ category, deals: !deals, query: shopQuery })}
            className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-[13px] font-medium transition',
              deals ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink/75 hover:border-ink',
            )}
          >
            <Tag size={14} /> Em oferta
            {deals && <X size={14} />}
          </button>
        </div>

        {loading ? (
          <ProductSkeletons className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5" count={10} />
        ) : error ? (
          <CatalogError />
        ) : list.length ? (
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
            {list.map((p) => (
              <li key={p.id} className="animate-pop-in">
                <ProductCard product={p} className="h-full" />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-line bg-white py-16 text-center">
            <p className="font-display text-lg font-bold">Nenhum produto encontrado</p>
            <p className="mt-1 text-sm text-ink/55">Tente outra busca ou categoria.</p>
            <button type="button" onClick={() => goShop()} className="btn-primary mt-5">
              Limpar filtros
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
