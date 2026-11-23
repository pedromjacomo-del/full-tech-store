import { useState } from 'react';
import type { Category } from '../data/categories';
import type { Product, ProductStatus } from '../data/products';
import { api } from '../lib/api';
import { ImageInput } from './ImageInput';
import { Field, Segmented, Sheet, Spinner, Toggle, parsePrice, priceToInput, slugify } from './ui';

export function ProductForm({
  product,
  categories,
  minPosition,
  onClose,
  onSaved,
  notify,
}: {
  product: Product | null;
  categories: Category[];
  minPosition: number;
  onClose: () => void;
  onSaved: (p: Product, isNew: boolean) => void;
  notify: (text: string, kind?: 'ok' | 'error' | 'info') => void;
}) {
  const isNew = !product;
  const [image, setImage] = useState(product?.image ?? '');
  const [name, setName] = useState(product?.name ?? '');
  const [variant, setVariant] = useState(product?.variant ?? '');
  const [category, setCategory] = useState(product?.category ?? categories[0]?.slug ?? '');
  const [onRequest, setOnRequest] = useState(product ? product.price === null : false);
  const [price, setPrice] = useState(priceToInput(product?.price));
  const [oldPrice, setOldPrice] = useState(priceToInput(product?.oldPrice));
  const [status, setStatus] = useState<ProductStatus>(product?.status ?? 'ativo');
  const [featured, setFeatured] = useState(!!product?.featured);
  const [description, setDescription] = useState(product?.description ?? '');
  const [features, setFeatures] = useState((product?.features ?? []).join('\n'));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Fotos enviadas nesta edição que não foram salvas são apagadas ao cancelar.
  const [uploaded, setUploaded] = useState<string[]>([]);

  function close() {
    uploaded.forEach((u) => api.removeImage(u).catch(() => undefined));
    onClose();
  }

  async function submit() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Informe o nome do produto.';
    if (!category) e.category = 'Escolha uma categoria.';
    const p = onRequest ? null : parsePrice(price);
    const op = onRequest ? null : parsePrice(oldPrice);
    if (!onRequest && (p === null || p === 'invalid')) e.price = 'Informe um preço válido (ex.: 129,90) ou marque “Sob consulta”.';
    if (op === 'invalid') e.oldPrice = 'Preço inválido.';
    if (typeof p === 'number' && typeof op === 'number' && op <= p) e.oldPrice = 'O preço “de” precisa ser maior que o preço atual.';
    setErrors(e);
    if (Object.keys(e).length) return;

    const data: Product = {
      id: product?.id ?? `${slugify(name) || 'produto'}-${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
      variant: variant.trim(),
      category,
      price: p as number | null,
      oldPrice: (op as number | null) ?? null,
      image,
      featured,
      status,
      description: description.trim(),
      features: features
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean),
      position: product?.position ?? minPosition - 1,
    };

    setSaving(true);
    try {
      const saved = await api.saveProduct(data, isNew);
      // Foto antiga substituída → apaga do armazenamento.
      if (product?.image && product.image !== saved.image) api.removeImage(product.image).catch(() => undefined);
      uploaded.filter((u) => u !== saved.image).forEach((u) => api.removeImage(u).catch(() => undefined));
      onSaved(saved, isNew);
    } catch (err) {
      notify((err as Error).message, 'error');
      setSaving(false);
    }
  }

  return (
    <Sheet
      title={isNew ? 'Novo produto' : 'Editar produto'}
      onClose={close}
      footer={
        <div className="flex gap-2">
          <button type="button" onClick={close} className="flex-1 rounded-lg border border-line py-3 text-sm font-semibold transition hover:bg-surface sm:flex-none sm:px-6">
            Cancelar
          </button>
          <button type="button" onClick={submit} disabled={saving} className="btn-primary flex-[2] py-3 disabled:opacity-60">
            {saving && <Spinner size={16} />} {isNew ? 'Cadastrar produto' : 'Salvar alterações'}
          </button>
        </div>
      }
    >
      <form
        className="space-y-5"
        onSubmit={(ev) => {
          ev.preventDefault();
          submit();
        }}
      >
        <div className="rounded-2xl border border-line bg-white p-4">
          <p className="mb-3 text-[13px] font-semibold text-ink/80">Foto do produto</p>
          <ImageInput
            value={image}
            onChange={(url) => {
              setImage(url);
              if (url) setUploaded((u) => [...u, url]);
            }}
            folder="produtos"
            maxSize={1000}
            allowRemove
            onError={(m) => notify(m, 'error')}
          />
          <p className="mt-3 text-center text-xs text-ink/50">Dica: foto quadrada, fundo branco, produto centralizado.</p>
        </div>

        <div className="space-y-4 rounded-2xl border border-line bg-white p-4">
          <Field label="Nome" required error={errors.name}>
            <input value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Ex.: Capinha MagSafe" autoFocus={isNew} />
          </Field>
          <Field label="Detalhe / variação" hint="Aparece entre parênteses embaixo do nome. Ex.: Transparente, 256 GB, iPhone 16 Pro.">
            <input value={variant} onChange={(e) => setVariant(e.target.value)} className="input" placeholder="Ex.: Transparente" />
          </Field>
          <Field label="Categoria" required error={errors.category}>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="input">
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="space-y-4 rounded-2xl border border-line bg-white p-4">
          <Toggle
            checked={onRequest}
            onChange={setOnRequest}
            label="Preço sob consulta"
            description="Sem preço no site; o botão leva para o WhatsApp (ideal para iPhones)."
          />
          {!onRequest && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Preço (R$)" required error={errors.price}>
                <input value={price} onChange={(e) => setPrice(e.target.value)} className="input" inputMode="decimal" placeholder="129,90" />
              </Field>
              <Field label="Preço “de” (opcional)" error={errors.oldPrice} hint="Aparece riscado e coloca o produto em Ofertas.">
                <input value={oldPrice} onChange={(e) => setOldPrice(e.target.value)} className="input" inputMode="decimal" placeholder="159,90" />
              </Field>
            </div>
          )}
        </div>

        <div className="space-y-4 rounded-2xl border border-line bg-white p-4">
          <div>
            <p className="mb-2 text-[13px] font-semibold text-ink/80">Situação</p>
            <Segmented
              value={status}
              onChange={setStatus}
              options={[
                { value: 'ativo', label: 'À venda', hint: 'aparece normal' },
                { value: 'esgotado', label: 'Esgotado', hint: 'aparece com selo' },
                { value: 'oculto', label: 'Oculto', hint: 'não aparece' },
              ]}
            />
          </div>
          <Toggle checked={featured} onChange={setFeatured} label="Mostrar em “Mais Vendidos”" description="Vitrine da página inicial (até 6 produtos à venda)." />
        </div>

        <div className="space-y-4 rounded-2xl border border-line bg-white p-4">
          <Field label="Descrição" hint="Aparece quando o cliente abre o produto.">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="input resize-y" />
          </Field>
          <Field label="Características" hint="Uma por linha. Ex.: Ímãs MagSafe">
            <textarea value={features} onChange={(e) => setFeatures(e.target.value)} rows={4} className="input resize-y" />
          </Field>
        </div>
        <button type="submit" className="sr-only">
          Salvar
        </button>
      </form>
    </Sheet>
  );
}
