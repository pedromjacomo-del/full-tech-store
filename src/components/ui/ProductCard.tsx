import { MessageCircle, ShoppingCart } from 'lucide-react';
import type { Product } from '../../data/products';
import { contactLink } from '../../config/site';
import { useStore } from '../../context/StoreContext';
import { useCatalog } from '../../context/CatalogContext';
import { cn, formatPrice } from '../../lib/utils';

export function ProductCard({ product, className }: { product: Product; className?: string }) {
  const { openProduct, addToCart } = useStore();
  const { categoryBySlug } = useCatalog();
  const onRequest = product.price === null;
  const soldOut = product.status === 'esgotado';
  const actionCls =
    'grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand text-ink shadow-[0_6px_14px_-6px_rgb(142_209_63/0.9)] transition hover:scale-110 hover:bg-brand-2 active:scale-95';

  return (
    <article className={cn('card group relative flex flex-col overflow-hidden p-2.5', className)}>
      <button
        type="button"
        onClick={() => openProduct(product.id)}
        className="relative block aspect-square overflow-hidden rounded-lg bg-white"
        aria-label={`Ver ${product.name}`}
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className={cn('h-full w-full object-contain p-2 transition duration-500 group-hover:scale-105', soldOut && 'opacity-45 grayscale')}
        />
        {soldOut && (
          <span className="absolute left-2 top-2 rounded-full bg-ink px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide text-white">
            Esgotado
          </span>
        )}
      </button>

      <div className="flex flex-1 flex-col px-1 pt-2">
        <p className="text-[10.5px] font-semibold uppercase tracking-wider text-brand-deep">
          {categoryBySlug(product.category)?.name}
        </p>
        <button
          type="button"
          onClick={() => openProduct(product.id)}
          className="mt-0.5 text-left text-[12.5px] font-medium leading-snug text-ink transition hover:text-brand-deep"
        >
          {product.name}
          <br />
          <span className="text-ink/70">({product.variant})</span>
        </button>

        <div className="mt-auto flex items-end justify-between gap-1.5 pt-2.5 pb-0.5">
          <p className="flex min-w-0 flex-col items-start whitespace-nowrap leading-tight">
            <span className={cn('font-bold tracking-tight text-ink', onRequest ? 'text-[13px]' : 'text-[15px]')}>
              {formatPrice(product.price)}
            </span>
            {product.oldPrice && (
              <span className="text-[10.5px] text-ink/40 line-through">{formatPrice(product.oldPrice)}</span>
            )}
          </p>
          {soldOut ? (
            <span
              className="grid h-8 w-8 shrink-0 cursor-not-allowed place-items-center rounded-lg bg-surface text-ink/30"
              title="Esgotado"
              aria-label={`${product.name} esgotado`}
            >
              <ShoppingCart size={15} strokeWidth={2.2} />
            </span>
          ) : onRequest ? (
            <a
              href={contactLink(`Olá! Tenho interesse no ${product.name}. Pode me passar cores, capacidades e valores?`)}
              target="_blank"
              rel="noreferrer"
              className={actionCls}
              aria-label={`Consultar ${product.name}`}
              title="Consultar"
            >
              <MessageCircle size={15} strokeWidth={2.2} />
            </a>
          ) : (
            <button type="button" onClick={() => addToCart(product.id)} className={actionCls} aria-label={`Adicionar ${product.name} ao carrinho`}>
              <ShoppingCart size={15} strokeWidth={2.2} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
