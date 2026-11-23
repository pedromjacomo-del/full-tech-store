import { useMemo, useState } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import type { Product } from '../../data/products';
import type { Category } from '../../data/categories';
import { useStore } from '../../context/StoreContext';
import { useCatalog } from '../../context/CatalogContext';
import { formatPrice } from '../../lib/utils';
import { Backdrop, CloseButton } from '../ui/Overlay';

const normalize = (t: string) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export function searchProducts(products: Product[], categories: Category[], query: string) {
  const terms = normalize(query).trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return products.filter((p) => {
    const catName = categories.find((c) => c.slug === p.category)?.name ?? '';
    const hay = normalize(`${p.name} ${p.variant} ${catName} ${p.description}`);
    return terms.every((t) => hay.includes(t));
  });
}

export function SearchOverlay() {
  const { close, openProduct, goShop } = useStore();
  const { products, categories, categoryBySlug } = useCatalog();
  const [q, setQ] = useState('');
  const results = useMemo(() => searchProducts(products, categories, q), [products, categories, q]);

  return (
    <>
      <Backdrop onClose={close} />
      <div className="fixed inset-x-0 top-0 z-50 animate-drop-in bg-white shadow-2xl" role="dialog" aria-modal="true" aria-label="Buscar produtos">
        <div className="container-x py-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (q.trim()) goShop({ query: q.trim() });
            }}
            className="flex items-center gap-3"
          >
            <Search size={22} className="shrink-0 text-brand-deep" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar iPhones, capinhas, películas, fones…"
              className="h-12 flex-1 bg-transparent text-lg outline-none placeholder:text-ink/35"
              aria-label="Buscar"
            />
            <CloseButton onClick={close} />
          </form>

          <div className="max-h-[65dvh] overflow-y-auto border-t border-line pt-4 pb-2">
            {!q.trim() && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink/45">Categorias</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <button
                      key={c.slug}
                      type="button"
                      onClick={() => goShop({ category: c.slug })}
                      className="rounded-full border border-line px-3.5 py-1.5 text-sm transition hover:border-brand hover:text-brand-deep"
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {q.trim() && results.length === 0 && (
              <p className="py-6 text-center text-sm text-ink/55">
                Nenhum produto encontrado para “{q}”. Tente “capinha”, “película” ou “fone”.
              </p>
            )}

            {results.length > 0 && (
              <>
                <ul className="grid gap-1 sm:grid-cols-2">
                  {results.slice(0, 8).map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => openProduct(p.id)}
                        className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-surface"
                      >
                        <img src={p.image} alt="" className="h-14 w-14 shrink-0 rounded-lg border border-line bg-white object-contain p-1" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">{p.name} ({p.variant})</span>
                          <span className="text-xs text-ink/50">{categoryBySlug(p.category)?.name}</span>
                        </span>
                        <span className="text-sm font-bold">{formatPrice(p.price)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => goShop({ query: q.trim() })}
                  className="link-orange mt-3 text-sm font-semibold"
                >
                  Ver todos os {results.length} resultados <ArrowRight size={15} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
