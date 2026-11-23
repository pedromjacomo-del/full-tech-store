import { useState } from 'react';
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from 'lucide-react';
import type { Category } from '../data/categories';
import { api } from '../lib/api';
import { cn, imageSrc } from '../lib/utils';
import type { AdminCtx } from './Dashboard';
import { ImageInput } from './ImageInput';
import { ConfirmDialog, Field, Sheet, Spinner, slugify } from './ui';

export function CategoriesTab({ catalog, setCatalog, notify }: AdminCtx) {
  const [editing, setEditing] = useState<Category | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [busy, setBusy] = useState(false);

  const cats = [...catalog.categories].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  const countOf = (slug: string) => catalog.products.filter((p) => p.category === slug).length;

  async function move(index: number, dir: -1 | 1) {
    const a = cats[index];
    const b = cats[index + dir];
    if (!a || !b) return;
    setBusy(true);
    try {
      const [sa, sb] = await Promise.all([
        api.saveCategory({ ...a, position: b.position ?? index + dir }, false),
        api.saveCategory({ ...b, position: a.position ?? index }, false),
      ]);
      setCatalog((c) => ({ ...c, categories: c.categories.map((x) => (x.slug === sa.slug ? sa : x.slug === sb.slug ? sb : x)) }));
    } catch (e) {
      notify((e as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    setBusy(true);
    try {
      await api.deleteCategory(deleting.slug);
      if (deleting.image) api.removeImage(deleting.image).catch(() => undefined);
      setCatalog((c) => ({ ...c, categories: c.categories.filter((x) => x.slug !== deleting.slug) }));
      notify(`Categoria "${deleting.name}" excluída.`);
      setDeleting(null);
    } catch (e) {
      notify((e as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Categorias</h1>
          <p className="mt-0.5 text-sm text-ink/55">Os cards de “Compre por Categoria”. Use as setas para mudar a ordem.</p>
        </div>
        <button type="button" onClick={() => setEditing('new')} className="btn-primary py-2.5">
          <Plus size={18} strokeWidth={2.5} /> Nova categoria
        </button>
      </div>

      <ul className="mt-5 grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cats.map((c, i) => {
          const count = countOf(c.slug);
          return (
            <li key={c.slug} className={cn('flex gap-3 rounded-xl border border-line bg-white p-3', busy && 'opacity-70')}>
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-line bg-white">
                {c.image ? <img src={imageSrc(c.image)} alt="" className="h-full w-full object-contain p-1" /> : null}
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <p className="truncate font-semibold">{c.name}</p>
                <p className="text-xs text-ink/55">
                  {count} {count === 1 ? 'produto' : 'produtos'}
                </p>
                <div className="mt-auto flex items-center gap-1 pt-2">
                  <button type="button" disabled={busy || i === 0} onClick={() => move(i, -1)} className="grid h-8 w-8 place-items-center rounded-lg text-ink/55 transition hover:bg-surface disabled:opacity-25" aria-label="Mover para cima">
                    <ArrowUp size={15} />
                  </button>
                  <button type="button" disabled={busy || i === cats.length - 1} onClick={() => move(i, 1)} className="grid h-8 w-8 place-items-center rounded-lg text-ink/55 transition hover:bg-surface disabled:opacity-25" aria-label="Mover para baixo">
                    <ArrowDown size={15} />
                  </button>
                  <span className="flex-1" />
                  <button type="button" onClick={() => setEditing(c)} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-ink/70 transition hover:bg-surface">
                    <Pencil size={14} /> Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => (count ? notify(`Mova ou apague os ${count} produtos de "${c.name}" antes de excluir a categoria.`, 'info') : setDeleting(c))}
                    className="grid h-8 w-8 place-items-center rounded-lg text-ink/40 transition hover:bg-red-50 hover:text-red-600"
                    aria-label={`Excluir ${c.name}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {editing && (
        <CategoryForm
          category={editing === 'new' ? null : editing}
          existing={cats}
          onClose={() => setEditing(null)}
          notify={notify}
          onSaved={(saved, isNew) => {
            setCatalog((c) => ({
              ...c,
              categories: isNew ? [...c.categories, saved] : c.categories.map((x) => (x.slug === saved.slug ? saved : x)),
            }));
            notify(isNew ? `Categoria "${saved.name}" criada.` : `Categoria "${saved.name}" atualizada.`);
            setEditing(null);
          }}
        />
      )}

      {deleting && (
        <ConfirmDialog
          danger
          title="Excluir categoria?"
          message={
            <>
              A categoria <b>{deleting.name}</b> vai sair do site.
            </>
          }
          confirmLabel="Excluir"
          busy={busy}
          onCancel={() => setDeleting(null)}
          onConfirm={confirmDelete}
        />
      )}
    </section>
  );
}

function CategoryForm({
  category,
  existing,
  onClose,
  onSaved,
  notify,
}: {
  category: Category | null;
  existing: Category[];
  onClose: () => void;
  onSaved: (c: Category, isNew: boolean) => void;
  notify: (text: string, kind?: 'ok' | 'error' | 'info') => void;
}) {
  const isNew = !category;
  const [name, setName] = useState(category?.name ?? '');
  const [image, setImage] = useState(category?.image ?? '');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit() {
    const trimmed = name.trim();
    if (!trimmed) return setError('Informe o nome da categoria.');
    const slug = category?.slug ?? slugify(trimmed);
    if (!slug) return setError('Use letras ou números no nome.');
    if (isNew && existing.some((c) => c.slug === slug)) return setError('Já existe uma categoria com esse nome.');
    setSaving(true);
    try {
      const saved = await api.saveCategory(
        { slug, name: trimmed, image, position: category?.position ?? Math.max(-1, ...existing.map((c) => c.position ?? 0)) + 1 },
        isNew,
      );
      if (category?.image && category.image !== saved.image) api.removeImage(category.image).catch(() => undefined);
      onSaved(saved, isNew);
    } catch (e) {
      notify((e as Error).message, 'error');
      setSaving(false);
    }
  }

  return (
    <Sheet
      title={isNew ? 'Nova categoria' : 'Editar categoria'}
      onClose={onClose}
      footer={
        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-line py-3 text-sm font-semibold transition hover:bg-surface sm:flex-none sm:px-6">
            Cancelar
          </button>
          <button type="button" onClick={submit} disabled={saving} className="btn-primary flex-[2] py-3 disabled:opacity-60">
            {saving && <Spinner size={16} />} {isNew ? 'Criar categoria' : 'Salvar alterações'}
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="rounded-2xl border border-line bg-white p-4">
          <p className="mb-3 text-[13px] font-semibold text-ink/80">Imagem do card</p>
          <ImageInput value={image} onChange={setImage} folder="categorias" maxSize={900} onError={(m) => notify(m, 'error')} />
          <p className="mt-3 text-center text-xs text-ink/50">Ideal: 800 × 800 px, fundo branco.</p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-4">
          <Field label="Nome" required error={error}>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              className="input"
              placeholder="Ex.: Smartwatches"
              autoFocus={isNew}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
            />
          </Field>
        </div>
      </div>
    </Sheet>
  );
}
