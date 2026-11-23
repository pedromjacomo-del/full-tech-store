import { useMemo, useState } from 'react';
import { EyeOff, PackageCheck, PackageX, Pencil, Plus, Search, Star, Trash2 } from 'lucide-react';
import type { Product, ProductStatus } from '../data/products';
import { api } from '../lib/api';
import { cn, formatPrice, imageSrc } from '../lib/utils';
import type { AdminCtx } from './Dashboard';
import { ProductForm } from './ProductForm';
import { ConfirmDialog, STATUS_LABEL, StatusPill } from './ui';

type StatusFilter = 'todos' | ProductStatus;

const normalize = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function ProductsTab({ catalog, setCatalog, notify }: AdminCtx) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('todas');
  const [status, setStatus] = useState<StatusFilter>('todos');
  const [editing, setEditing] = useState<Product | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const catName = (slug: string) => catalog.categories.find((c) => c.slug === slug)?.name ?? slug;

  const list = useMemo(() => {
    const q = normalize(query.trim());
    return [...catalog.products]
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      .filter((p) => category === 'todas' || p.category === category)
      .filter((p) => status === 'todos' || (p.status ?? 'ativo') === status)
      .filter((p) => !q || normalize(`${p.name} ${p.variant}`).includes(q));
  }, [catalog.products, query, category, status]);

  const counts = useMemo(() => {
    const c = { todos: catalog.products.length, ativo: 0, esgotado: 0, oculto: 0 };
    catalog.products.forEach((p) => (c[p.status ?? 'ativo'] += 1));
    return c;
  }, [catalog.products]);

  const featuredCount = catalog.products.filter((p) => p.featured && (p.status ?? 'ativo') === 'ativo').length;

  async function quickSave(p: Product, patch: Partial<Product>, message: string) {
    setBusyId(p.id);
    try {
      const saved = await api.saveProduct({ ...p, ...patch }, false);
      setCatalog((c) => ({ ...c, products: c.products.map((x) => (x.id === saved.id ? saved : x)) }));
      notify(message);
    } catch (e) {
      notify((e as Error).message, 'error');
    } finally {
      setBusyId(null);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    const p = deleting;
    setBusyId(p.id);
    try {
      await api.deleteProduct(p.id);
      if (p.image) api.removeImage(p.image).catch(() => undefined);
      setCatalog((c) => ({ ...c, products: c.products.filter((x) => x.id !== p.id) }));
      notify(`"${p.name}" foi excluído.`);
      setDeleting(null);
    } catch (e) {
      notify((e as Error).message, 'error');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Produtos</h1>
          <p className="mt-0.5 text-sm text-ink/55">
            {counts.ativo} à venda · {counts.esgotado} esgotados · {counts.oculto} ocultos
          </p>
          <p className={cn('mt-0.5 text-xs', featuredCount > 6 ? 'font-medium text-amber-700' : 'text-ink/45')}>
            {featuredCount} em destaque {featuredCount > 6 ? '— o site mostra só os 6 primeiros da lista' : '· “Mais Vendidos” mostra até 6'}
          </p>
        </div>
        <button type="button" onClick={() => setEditing('new')} className="btn-primary hidden py-2.5 sm:inline-flex">
          <Plus size={18} strokeWidth={2.5} /> Novo produto
        </button>
      </div>

      {/* filtros */}
      <div className="mt-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_200px]">
        <label className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar produto" className="input pl-9" aria-label="Buscar produto" />
        </label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="input" aria-label="Filtrar por categoria">
          <option value="todas">Todas as categorias</option>
          {catalog.categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div className="no-scrollbar -mx-4 mt-2 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {(['todos', 'ativo', 'esgotado', 'oculto'] as StatusFilter[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            className={cn(
              'shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition',
              status === s ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink/70 hover:border-ink/30',
            )}
          >
            {s === 'todos' ? 'Todos' : STATUS_LABEL[s]} <span className="opacity-60">{counts[s]}</span>
          </button>
        ))}
      </div>

      {/* lista */}
      {list.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-line bg-white px-6 py-14 text-center">
          <p className="font-semibold">Nenhum produto encontrado</p>
          <p className="mt-1 text-sm text-ink/55">Mude os filtros ou cadastre um produto novo.</p>
        </div>
      ) : (
        <ul className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-2.5">
          {list.map((p) => {
            const st = p.status ?? 'ativo';
            const busy = busyId === p.id;
            return (
              <li
                key={p.id}
                className={cn('rounded-xl border border-line bg-white p-3 transition sm:p-3.5', busy && 'opacity-60', st === 'oculto' && 'bg-white/60')}
              >
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditing(p)}
                    className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-line bg-white sm:h-[72px] sm:w-[72px]"
                    aria-label={`Editar ${p.name}`}
                  >
                    {p.image ? (
                      <img src={imageSrc(p.image)} alt="" className={cn('h-full w-full object-contain p-1', st !== 'ativo' && 'opacity-50')} />
                    ) : (
                      <span className="grid h-full place-items-center text-[10px] text-ink/40">Sem foto</span>
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <button type="button" onClick={() => setEditing(p)} className="min-w-0 text-left">
                        <p className="truncate text-sm font-semibold">{p.name}</p>
                        <p className="truncate text-xs text-ink/55">
                          {p.variant ? `${p.variant} · ` : ''}
                          {catName(p.category)}
                        </p>
                      </button>
                      <StatusPill status={st} />
                    </div>
                    <p className="mt-1.5 flex flex-wrap items-baseline gap-x-2 text-sm">
                      <span className="font-bold">{formatPrice(p.price)}</span>
                      {p.oldPrice ? <span className="text-xs text-ink/40 line-through">{formatPrice(p.oldPrice)}</span> : null}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-line pt-2.5">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      quickSave(p, { featured: !p.featured }, p.featured ? 'Removido de “Mais Vendidos”.' : 'Adicionado a “Mais Vendidos”.')
                    }
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition',
                      p.featured ? 'bg-brand/20 text-ink' : 'text-ink/55 hover:bg-surface',
                    )}
                    title="Mostrar em Mais Vendidos"
                  >
                    <Star size={14} fill={p.featured ? 'currentColor' : 'none'} className={p.featured ? 'text-brand-deep' : ''} />
                    Destaque
                  </button>
                  {st === 'ativo' ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => quickSave(p, { status: 'esgotado' }, `"${p.name}" marcado como esgotado.`)}
                      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-ink/55 transition hover:bg-amber-50 hover:text-amber-700"
                    >
                      <PackageX size={14} /> Esgotou
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => quickSave(p, { status: 'ativo' }, `"${p.name}" voltou a ficar à venda.`)}
                      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
                    >
                      <PackageCheck size={14} /> Pôr à venda
                    </button>
                  )}
                  {st !== 'oculto' && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => quickSave(p, { status: 'oculto' }, `"${p.name}" foi ocultado do site.`)}
                      className="hidden items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-ink/55 transition hover:bg-surface sm:inline-flex"
                    >
                      <EyeOff size={14} /> Ocultar
                    </button>
                  )}
                  <span className="flex-1" />
                  <button
                    type="button"
                    onClick={() => setEditing(p)}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-ink/70 transition hover:bg-surface"
                  >
                    <Pencil size={14} /> Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleting(p)}
                    className="grid h-8 w-8 place-items-center rounded-lg text-ink/40 transition hover:bg-red-50 hover:text-red-600"
                    aria-label={`Excluir ${p.name}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* botão flutuante no celular */}
      <button
        type="button"
        onClick={() => setEditing('new')}
        className="btn-primary fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-20 h-14 rounded-full px-5 shadow-xl sm:hidden"
      >
        <Plus size={20} strokeWidth={2.5} /> Novo produto
      </button>

      {editing && (
        <ProductForm
          product={editing === 'new' ? null : editing}
          categories={catalog.categories}
          minPosition={Math.min(0, ...catalog.products.map((p) => p.position ?? 0))}
          onClose={() => setEditing(null)}
          onSaved={(saved, isNew) => {
            setCatalog((c) => ({
              ...c,
              products: isNew ? [saved, ...c.products] : c.products.map((x) => (x.id === saved.id ? saved : x)),
            }));
            notify(isNew ? `"${saved.name}" cadastrado e já está no site.` : `"${saved.name}" atualizado.`);
            setEditing(null);
          }}
          notify={notify}
        />
      )}

      {deleting && (
        <ConfirmDialog
          danger
          title="Excluir produto?"
          message={
            <>
              <b>{deleting.name}</b> será apagado do site e do painel. Se ele só acabou no estoque, prefira <b>“Esgotou”</b> — assim dá para
              reativar depois.
            </>
          }
          confirmLabel="Excluir"
          busy={busyId === deleting.id}
          onCancel={() => setDeleting(null)}
          onConfirm={confirmDelete}
        />
      )}
    </section>
  );
}
