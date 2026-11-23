import { useState } from 'react';
import { Check, CreditCard, MapPin, MessageCircle, ShoppingCart } from 'lucide-react';
import { discountOf } from '../../data/products';
import { useCatalog } from '../../context/CatalogContext';
import { contactLink, site } from '../../config/site';
import { useStore } from '../../context/StoreContext';
import { formatPrice } from '../../lib/utils';
import { CloseButton, Modal } from '../ui/Overlay';
import { QtyStepper } from '../ui/QtyStepper';

export function ProductModal({ id }: { id: string }) {
  const { closeProduct, addToCart, open, goShop } = useStore();
  const [qty, setQty] = useState(1);
  const { productById, categoryBySlug } = useCatalog();
  const p = productById(id);
  if (!p) return null;
  const cat = categoryBySlug(p.category);
  const off = discountOf(p);
  const onRequest = p.price === null;
  const soldOut = p.status === 'esgotado';

  return (
    <Modal onClose={closeProduct} label={p.name} className="max-w-4xl">
      <CloseButton onClick={closeProduct} className="absolute right-3 top-3 z-10 bg-white/80" />
      <div className="grid md:grid-cols-2">
        <div className="relative bg-surface p-4 sm:p-10">
          {off > 0 && (
            <span className="absolute left-4 top-4 rounded-full bg-brand px-2.5 py-1 text-xs font-bold text-ink">-{off}%</span>
          )}
          {soldOut && (
            <span className="absolute right-4 top-4 rounded-full bg-ink px-2.5 py-1 text-xs font-bold uppercase text-white sm:right-auto sm:left-4 sm:top-12">Esgotado</span>
          )}
          <img src={p.image} alt={p.name} className="mx-auto aspect-square w-full max-w-[220px] object-contain sm:max-w-sm" />
        </div>

        <div className="flex flex-col p-5 sm:p-8">
          {cat && (
            <button
              type="button"
              onClick={() => goShop({ category: cat.slug })}
              className="self-start text-xs font-semibold uppercase tracking-wider text-brand-deep hover:underline"
            >
              {cat.name}
            </button>
          )}
          <h2 className="mt-2 font-display text-2xl font-bold leading-tight">{p.name}</h2>
          <p className="mt-0.5 text-ink/60">({p.variant})</p>

          <p className="mt-4 flex flex-wrap items-baseline gap-2.5">
            <span className={onRequest ? 'text-2xl font-bold' : 'text-[28px] font-bold'}>{formatPrice(p.price)}</span>
            {p.oldPrice && <span className="text-base text-ink/40 line-through">{formatPrice(p.oldPrice)}</span>}
            {off > 0 && <span className="text-sm font-semibold text-brand-deep">Economize {off}%</span>}
          </p>

          <p className="mt-4 text-sm leading-relaxed text-ink/70">{p.description}</p>
          <ul className="mt-4 grid gap-1.5 text-sm">
            {p.features.map((f) => (
              <li key={f} className="flex items-center gap-2">
                <Check size={15} className="shrink-0 text-brand-deep" strokeWidth={2.6} /> {f}
              </li>
            ))}
          </ul>

          {soldOut ? (
            <>
              <p className="mt-6 rounded-lg bg-surface px-4 py-3 text-center text-sm font-semibold text-ink/70">Produto esgotado no momento</p>
              <a
                href={contactLink(`Olá! O ${p.name} (${p.variant}) vai voltar ao estoque? Quero ser avisado(a).`)}
                target="_blank"
                rel="noreferrer"
                className="btn-primary mt-3 w-full py-3.5"
              >
                <MessageCircle size={17} /> Avise-me quando chegar
              </a>
            </>
          ) : onRequest ? (
            <a
              href={contactLink(`Olá! Tenho interesse no ${p.name}. Pode me passar cores, capacidades e valores?`)}
              target="_blank"
              rel="noreferrer"
              className="btn-primary mt-6 w-full py-3.5"
            >
              <MessageCircle size={17} /> Consultar disponibilidade
            </a>
          ) : (
            <>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <QtyStepper value={qty} onChange={setQty} />
                <button
                  type="button"
                  className="btn-primary flex-1 py-3"
                  onClick={() => {
                    addToCart(p.id, qty);
                    closeProduct();
                  }}
                >
                  <ShoppingCart size={17} /> Adicionar ao carrinho
                </button>
              </div>
              <button
                type="button"
                className="mt-3 w-full rounded-lg border border-ink py-3 text-sm font-semibold transition hover:bg-ink hover:text-white"
                onClick={() => {
                  addToCart(p.id, qty);
                  closeProduct();
                  open('cart');
                }}
              >
                Comprar agora
              </button>
            </>
          )}

          <ul className="mt-6 grid grid-cols-3 gap-2 border-t border-line pt-5 text-center text-[11px] text-ink/60">
            <li className="flex flex-col items-center gap-1.5"><MapPin size={18} className="text-brand-deep" />Retirada ou entrega</li>
            <li className="flex flex-col items-center gap-1.5"><CreditCard size={18} className="text-brand-deep" />{site.payments.join(' · ')}</li>
            <li className="flex flex-col items-center gap-1.5"><MessageCircle size={18} className="text-brand-deep" />Atendimento no WhatsApp</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
}
