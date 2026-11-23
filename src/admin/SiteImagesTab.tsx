import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { site } from '../config/site';
import { api, type SiteSettings } from '../lib/api';
import type { AdminCtx } from './Dashboard';
import { ImageInput } from './ImageInput';
import { Spinner } from './ui';

const SLOTS: { key: keyof SiteSettings; title: string; where: string; size: string; tip: string; fallback: string; max: number }[] = [
  {
    key: 'heroImage',
    title: 'Imagem do topo',
    where: 'Primeira coisa que o cliente vê, ao lado de “Seu próximo upgrade”.',
    size: '1720 × 1100 px',
    tip: 'Fundo escuro, produtos à direita. A borda esquerda e o topo se misturam ao fundo do site.',
    fallback: site.hero.image,
    max: 1800,
  },
  {
    key: 'promoImage',
    title: 'Banner “Proteja seu iPhone”',
    where: 'Faixa escura no meio da página inicial (o texto e o botão são do site).',
    size: '900 × 830 px (só os produtos)',
    tip: 'Use só a parte com os produtos, sem textos — o título e o botão já ficam à esquerda.',
    fallback: site.promo.image,
    max: 1400,
  },
];

export function SiteImagesTab({ catalog, setCatalog, notify }: AdminCtx) {
  const [saving, setSaving] = useState<keyof SiteSettings | null>(null);

  async function save(key: keyof SiteSettings, value: string, message: string) {
    const previous = catalog.settings[key];
    setSaving(key);
    try {
      await api.saveSettings({ [key]: value });
      setCatalog((c) => ({ ...c, settings: { ...c.settings, [key]: value } }));
      if (previous && previous !== value) api.removeImage(previous).catch(() => undefined);
      notify(message);
    } catch (e) {
      notify((e as Error).message, 'error');
    } finally {
      setSaving(null);
    }
  }

  return (
    <section>
      <h1 className="font-display text-2xl font-bold">Imagens do site</h1>
      <p className="mt-0.5 text-sm text-ink/55">Troque as fotos grandes da página inicial. A mudança aparece no site na hora.</p>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {SLOTS.map((s) => {
          const current = catalog.settings[s.key] || s.fallback;
          const custom = !!catalog.settings[s.key] && catalog.settings[s.key] !== s.fallback;
          return (
            <article key={s.key} className="rounded-2xl border border-line bg-white p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">{s.title}</h2>
                  <p className="mt-0.5 text-xs text-ink/55">{s.where}</p>
                </div>
                {saving === s.key && <Spinner className="shrink-0 text-ink/50" />}
              </div>
              <div className="mt-4">
                <ImageInput
                  value={current}
                  onChange={(url) => url && save(s.key, url, `${s.title} atualizada no site.`)}
                  folder="site"
                  maxSize={s.max}
                  shape="wide"
                  dark
                  onError={(m) => notify(m, 'error')}
                />
              </div>
              <p className="mt-3 text-xs text-ink/55">
                <b className="text-ink/75">Tamanho ideal:</b> {s.size}. {s.tip}
              </p>
              {custom && (
                <button
                  type="button"
                  onClick={() => save(s.key, s.fallback, `${s.title}: imagem original restaurada.`)}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-ink/55 transition hover:text-ink"
                >
                  <RotateCcw size={13} /> Voltar para a imagem original
                </button>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
