import { ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../ui/ProductCard';
import { ProductSkeletons } from '../ui/Skeleton';
import { useCatalog } from '../../context/CatalogContext';

export function TopPicks() {
  const { goShop } = useStore();
  const { featured, loading } = useCatalog();
  const listCls =
    'no-scrollbar -mx-4 mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-6';
  const itemCls = 'w-[46%] shrink-0 snap-start min-[480px]:w-[36%] sm:w-auto';
  if (!loading && featured.length === 0) return null;
  return (
    <section id="top-picks" className="scroll-mt-20 bg-surface pt-6 pb-8 sm:pb-10">
      <div className="container-x">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="font-display text-[22px] font-bold tracking-tight text-ink sm:text-[26px]">Mais Vendidos</h2>
              <span className="hidden h-0.5 w-12 rounded-full bg-gradient-to-r from-brand to-transparent sm:block" />
            </div>
            <p className="mt-1 text-[13px] text-ink/55 sm:text-sm">Os favoritos dos nossos clientes.</p>
          </div>
          <button type="button" onClick={() => goShop()} className="btn-outline shrink-0">
            Ver todos <ArrowRight size={14} strokeWidth={2.4} />
          </button>
        </div>

        {/* horizontal carousel on mobile, 6-column grid on desktop */}
        {loading ? (
          <ProductSkeletons className={listCls} itemClassName={itemCls} />
        ) : (
          <ul className={listCls}>
            {featured.map((p) => (
              <li key={p.id} className={itemCls}>
                <ProductCard product={p} className="h-full" />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
