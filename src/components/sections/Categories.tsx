import { ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useCatalog } from '../../context/CatalogContext';
import { CatalogError } from '../ui/CatalogError';
import { SectionHeading } from '../ui/SectionHeading';

export function Categories() {
  const { goShop } = useStore();
  const { categories, loading, error } = useCatalog();
  return (
    <section id="categories" className="scroll-mt-20 bg-surface pt-10 pb-5 sm:pt-14 sm:pb-6">
      <div className="container-x">
        <SectionHeading title="Compre por Categoria" subtitle="Encontre o acessório ideal para o seu celular." />
        {error && <CatalogError />}
        <ul className="mt-6 grid grid-cols-3 gap-2.5 sm:mt-7 sm:gap-4 lg:grid-cols-6">
          {loading &&
            Array.from({ length: 6 }, (_, i) => (
              <li key={i} className="rounded-xl border border-line bg-white p-2 sm:p-3">
                <div className="aspect-square animate-pulse rounded-lg bg-surface" />
                <div className="mx-auto mt-3 h-3 w-2/3 animate-pulse rounded bg-surface" />
              </li>
            ))}
          {categories.map((c) => (
            <li key={c.slug}>
              <a
                href={`#shop-${c.slug}`}
                onClick={(e) => {
                  e.preventDefault();
                  goShop({ category: c.slug });
                }}
                className="card group flex h-full flex-col items-center px-2 pt-2 pb-3 text-center sm:px-3 sm:pt-3 sm:pb-4"
              >
                <span className="block aspect-square w-full overflow-hidden rounded-lg">
                  <img
                    src={c.image}
                    alt={c.name}
                    loading="lazy"
                    className="h-full w-full object-contain transition duration-500 group-hover:scale-[1.06]"
                  />
                </span>
                <span className="mt-1.5 text-[12px] font-semibold leading-tight text-ink sm:mt-2 sm:text-sm">{c.name}</span>
                <span className="link-orange mt-1.5 hidden text-xs font-medium sm:inline-flex">
                  Ver produtos <ArrowRight size={13} strokeWidth={2.4} />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
