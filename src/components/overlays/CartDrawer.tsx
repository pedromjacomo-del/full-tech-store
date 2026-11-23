import { useState, type ReactNode } from 'react';
import { ArrowRight, Check, Copy, MapPin, MessageCircle, ShoppingBag, Store, Trash2, Truck } from 'lucide-react';
import { contactLink, site } from '../../config/site';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';
import { cn, formatPrice } from '../../lib/utils';
import { Backdrop, CloseButton } from '../ui/Overlay';
import { QtyStepper } from '../ui/QtyStepper';

type Step = 'cart' | 'checkout' | 'done';
type Delivery = 'pickup' | 'delivery';

const PAYMENTS = ['Pix', 'Cartão de crédito', 'Cartão de débito'];

export function CartDrawer() {
  const cart = useCart();
  const { close, goShop, openProduct } = useStore();
  const [step, setStep] = useState<Step>('cart');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [payment, setPayment] = useState(PAYMENTS[0]);
  const [delivery, setDelivery] = useState<Delivery>('pickup');

  const channel = site.whatsapp ? 'WhatsApp' : 'Direct do Instagram';

  return (
    <>
      <Backdrop onClose={close} />
      <aside
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[420px] animate-slide-in-right flex-col bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Carrinho"
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-lg font-bold">
            {step === 'checkout' ? 'Finalizar pedido' : step === 'done' ? 'Pedido pronto' : `Meu carrinho (${cart.count})`}
          </h2>
          <CloseButton onClick={close} />
        </header>

        {step === 'done' ? (
          <div className="flex flex-1 flex-col overflow-y-auto px-5 py-6">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-brand/15 text-brand-deep">
              <Check size={28} strokeWidth={2.5} />
            </span>
            <h3 className="mt-4 font-display text-xl font-bold">Pedido gerado!</h3>
            <p className="mt-1.5 text-sm text-ink/60">
              Abrimos o {channel} com o seu pedido. Envie a mensagem para confirmar o pagamento e a {delivery === 'delivery' ? 'entrega' : 'retirada'}.
              Se a conversa não abriu, use o botão abaixo.
            </p>
            <pre className="mt-4 max-h-56 overflow-y-auto whitespace-pre-wrap rounded-xl border border-line bg-surface p-4 font-sans text-[13px] leading-relaxed text-ink/80">
              {message}
            </pre>
            <div className="mt-4 grid gap-2">
              <a href={contactLink(message)} target="_blank" rel="noreferrer" className="btn-primary w-full py-3.5">
                <MessageCircle size={17} /> Enviar pelo {channel}
              </a>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(message);
                    setCopied(true);
                  } catch {
                    setCopied(false);
                  }
                }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-ink py-3 text-sm font-semibold transition hover:bg-ink hover:text-white"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Pedido copiado' : 'Copiar pedido'}
              </button>
              {!site.whatsapp && (
                <p className="text-center text-xs text-ink/50">No Direct, cole a mensagem copiada.</p>
              )}
            </div>
          </div>
        ) : cart.items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <span className="grid h-20 w-20 place-items-center rounded-full bg-surface text-brand-deep">
              <ShoppingBag size={34} strokeWidth={1.5} />
            </span>
            <h3 className="mt-4 font-display text-lg font-bold">Seu carrinho está vazio</h3>
            <p className="mt-1 text-sm text-ink/55">Encontre o acessório ideal para o seu celular.</p>
            <button type="button" className="btn-primary mt-6" onClick={() => goShop()}>
              Ver produtos <ArrowRight size={16} />
            </button>
          </div>
        ) : step === 'cart' ? (
          <>
            <div className="flex items-center gap-2 border-b border-line bg-surface/60 px-5 py-3 text-[13px]">
              <Truck size={16} className="shrink-0 text-brand-deep" />
              Retire na loja ou receba em casa
            </div>

            <ul className="flex-1 divide-y divide-line overflow-y-auto overscroll-contain px-5">
              {cart.items.map(({ product: p, qty }) => (
                <li key={p.id} className="flex gap-3.5 py-4">
                  <button
                    type="button"
                    onClick={() => openProduct(p.id)}
                    className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-line bg-white"
                    aria-label={`Ver ${p.name}`}
                  >
                    <img src={p.image} alt="" className="h-full w-full object-contain p-1.5" />
                  </button>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium leading-snug">{p.name}</p>
                        <p className="text-xs text-ink/50">{p.variant}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => cart.remove(p.id)}
                        className="rounded p-1 text-ink/35 transition hover:text-red-500"
                        aria-label={`Remover ${p.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <QtyStepper size="sm" value={qty} onChange={(v) => cart.setQty(p.id, v)} />
                      <span className="text-sm font-bold">{formatPrice((p.price ?? 0) * qty)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <Summary delivery={delivery}>
              <button type="button" className="btn-primary w-full py-3.5" onClick={() => setStep('checkout')}>
                Finalizar pedido <ArrowRight size={17} />
              </button>
              <button type="button" onClick={() => goShop()} className="mt-2 w-full py-2 text-sm font-medium text-ink/60 transition hover:text-brand-deep">
                Continuar comprando
              </button>
            </Summary>
          </>
        ) : (
          <form
            className="flex flex-1 flex-col overflow-hidden"
            onSubmit={(e) => {
              e.preventDefault();
              const data = new FormData(e.currentTarget);
              const lines = cart.items.map(({ product: p, qty }) => `• ${qty}x ${p.name} (${p.variant}) — ${formatPrice((p.price ?? 0) * qty)}`);
              const text = [
                `Olá, ${site.name}! Fiz um pedido pelo site e gostaria de confirmar o pagamento e a ${delivery === 'delivery' ? 'entrega' : 'retirada'}:`,
                '',
                ...lines,
                '',
                `*Total: ${formatPrice(cart.total)}*${delivery === 'delivery' ? ' + entrega' : ''}`,
                `Pagamento: ${payment}`,
                delivery === 'delivery'
                  ? `Entrega: ${data.get('address')}${data.get('district') ? ` – ${data.get('district')}` : ''}`
                  : `Retirada: ${site.location}`,
                '',
                `Nome: ${data.get('name')}`,
                `Telefone: ${data.get('phone')}`,
                data.get('notes') ? `Observações: ${data.get('notes')}` : '',
              ]
                .filter((l, i, arr) => l !== '' || arr[i - 1] !== '')
                .join('\n')
                .trim();
              setMessage(text);
              // Abre o WhatsApp da loja com o pedido pronto.
              try {
                window.open(contactLink(text), '_blank', 'noopener');
              } catch {
                /* bloqueado — o botão na tela seguinte abre o link */
              }
              cart.clear();
              setStep('done');
            }}
          >
            <div className="flex-1 space-y-3.5 overflow-y-auto overscroll-contain px-5 py-4 sm:py-5">
              <Field label="Nome completo"><input name="name" required className="input" autoComplete="name" /></Field>
              <Field label="Telefone / WhatsApp"><input name="phone" required className="input" type="tel" placeholder="(61) 9 0000-0000" autoComplete="tel" /></Field>
              <fieldset>
                <legend className="mb-1.5 text-xs font-semibold text-ink/70">Como quer receber?</legend>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { id: 'pickup', label: 'Retirar na loja', Icon: Store },
                    { id: 'delivery', label: 'Entrega', Icon: Truck },
                  ] as const).map(({ id, label, Icon }) => (
                    <label
                      key={id}
                      className={cn(
                        'flex cursor-pointer items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-sm transition',
                        delivery === id ? 'border-brand bg-brand/10 font-medium' : 'border-line hover:border-ink/20',
                      )}
                    >
                      <input type="radio" name="delivery" checked={delivery === id} onChange={() => setDelivery(id)} className="sr-only" />
                      <Icon size={17} className={delivery === id ? 'text-brand-deep' : 'text-ink/40'} />
                      {label}
                    </label>
                  ))}
                </div>
              </fieldset>
              {delivery === 'delivery' ? (
                <>
                  <Field label="Endereço de entrega"><input name="address" required className="input" placeholder="Rua, número, complemento" autoComplete="street-address" /></Field>
                  <Field label="Bairro / Cidade"><input name="district" required className="input" placeholder="Ex.: Águas Claras – DF" autoComplete="address-level2" /></Field>
                </>
              ) : (
                <p className="flex items-start gap-2 rounded-lg bg-surface px-3.5 py-3 text-xs text-ink/65">
                  <MapPin size={15} className="mt-px shrink-0 text-brand-deep" />
                  Retirada no {site.location} · {site.hours}
                </p>
              )}
              <Field label="Observações (modelo do celular, cor…)"><textarea name="notes" rows={2} className="input resize-none" /></Field>
              <fieldset>
                <legend className="mb-1.5 text-xs font-semibold text-ink/70">Forma de pagamento</legend>
                <div className="grid gap-2">
                  {PAYMENTS.map((o) => (
                    <label
                      key={o}
                      className={cn(
                        'flex cursor-pointer items-center gap-3 rounded-lg border px-3.5 py-2.5 text-sm transition',
                        payment === o ? 'border-brand bg-brand/10' : 'border-line hover:border-ink/20',
                      )}
                    >
                      <input type="radio" name="payment" checked={payment === o} onChange={() => setPayment(o)} className="accent-[var(--color-brand-deep)]" />
                      {o}
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
            <Summary delivery={delivery}>
              <button type="submit" className="btn-primary w-full py-3.5">
                <MessageCircle size={17} /> Gerar pedido no WhatsApp
              </button>
              <p className="mt-2 hidden text-center text-[11px] text-ink/50 sm:block">Você confirma pagamento e entrega com a loja pelo WhatsApp.</p>
              <button type="button" onClick={() => setStep('cart')} className="mt-2 w-full py-2 text-sm font-medium text-ink/60 transition hover:text-brand-deep">
                Voltar ao carrinho
              </button>
            </Summary>
          </form>
        )}
      </aside>
    </>
  );
}

function Summary({ children, delivery }: { children: ReactNode; delivery: Delivery }) {
  const cart = useCart();
  return (
    <footer className="border-t border-line px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:pt-4 sm:pb-5">
      <dl className="space-y-1 text-[13px] sm:space-y-1.5 sm:text-sm">
        <div className="flex justify-between text-ink/65"><dt>Subtotal</dt><dd>{formatPrice(cart.total)}</dd></div>
        <div className="flex justify-between text-ink/65">
          <dt>{delivery === 'delivery' ? 'Entrega' : 'Retirada na loja'}</dt>
          <dd className="font-medium text-brand-deep">{delivery === 'delivery' ? 'A combinar no WhatsApp' : 'Grátis'}</dd>
        </div>
        <div className="flex justify-between pt-1.5 text-base font-bold"><dt>Total</dt><dd>{formatPrice(cart.total)}</dd></div>
      </dl>
      <div className="mt-3 sm:mt-4">{children}</div>
    </footer>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-ink/70">{label}</span>
      {children}
    </label>
  );
}
