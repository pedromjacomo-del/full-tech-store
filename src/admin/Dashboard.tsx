import { useCallback, useEffect, useState } from 'react';
import { ExternalLink, Images, LayoutGrid, LogOut, Package, Users } from 'lucide-react';
import { api, type Catalog } from '../lib/api';
import { cn } from '../lib/utils';
import { Logo } from '../components/ui/Logo';
import { CategoriesTab } from './CategoriesTab';
import { DemoNotice } from './DemoNotice';
import { ProductsTab } from './ProductsTab';
import { SiteImagesTab } from './SiteImagesTab';
import { TeamTab } from './TeamTab';
import { NoticeToast, Spinner, useNotices } from './ui';

type Tab = 'produtos' | 'categorias' | 'imagens' | 'equipe';

export interface AdminCtx {
  catalog: Catalog;
  setCatalog: (updater: (c: Catalog) => Catalog) => void;
  notify: (text: string, kind?: 'ok' | 'error' | 'info') => void;
}

export function Dashboard({ email, onSignOut }: { email: string; onSignOut: () => void }) {
  const [catalog, setCatalogState] = useState<Catalog | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('produtos');
  const { notice, notify, dismiss } = useNotices();

  const load = useCallback(() => {
    setLoadError(null);
    api
      .loadCatalog(true)
      .then(setCatalogState)
      .catch((e: Error) => setLoadError(e.message));
  }, []);
  useEffect(load, [load]);

  const setCatalog = useCallback((updater: (c: Catalog) => Catalog) => setCatalogState((c) => (c ? updater(c) : c)), []);

  const tabs: { id: Tab; label: string; Icon: typeof Package; count?: number }[] = [
    { id: 'produtos', label: 'Produtos', Icon: Package, count: catalog?.products.length },
    { id: 'categorias', label: 'Categorias', Icon: LayoutGrid, count: catalog?.categories.length },
    { id: 'imagens', label: 'Imagens do site', Icon: Images },
    { id: 'equipe', label: 'Equipe', Icon: Users },
  ];

  return (
    <div className="min-h-dvh overflow-x-clip bg-surface pb-24">
      <header className="sticky top-0 z-30 bg-ink text-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Logo onClick={() => (window.location.hash = 'home')} />
            <span className="rounded-full bg-brand px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-ink">Painel</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <a
              href="#home"
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              <ExternalLink size={16} /> <span className="hidden sm:inline">Ver site</span>
            </a>
            <button
              type="button"
              onClick={onSignOut}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
              title={`Sair (${email})`}
            >
              <LogOut size={16} /> <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-2 sm:px-4" aria-label="Seções do painel">
          {tabs.map(({ id, label, Icon, count }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                'relative flex shrink-0 items-center gap-2 px-3 pt-2 pb-3 text-sm font-medium transition',
                tab === id ? 'text-white' : 'text-white/55 hover:text-white/85',
              )}
            >
              <Icon size={16} />
              {label}
              {count !== undefined && (
                <span className={cn('rounded-full px-1.5 text-[11px] font-bold', tab === id ? 'bg-brand text-ink' : 'bg-white/10')}>{count}</span>
              )}
              {tab === id && <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-brand" />}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 pt-5 sm:px-6 sm:pt-7">
        {api.mode === 'demo' && <DemoNotice className="mb-5" />}

        {loadError ? (
          <div className="rounded-2xl border border-red-200 bg-white p-6 text-center">
            <p className="font-semibold text-red-700">Não foi possível carregar os dados</p>
            <p className="mt-1 text-sm text-ink/60">{loadError}</p>
            <button type="button" onClick={load} className="btn-primary mt-4">
              Tentar de novo
            </button>
          </div>
        ) : !catalog ? (
          <div className="flex items-center justify-center gap-2 py-20 text-sm text-ink/55">
            <Spinner /> Carregando dados da loja…
          </div>
        ) : tab === 'produtos' ? (
          <ProductsTab catalog={catalog} setCatalog={setCatalog} notify={notify} />
        ) : tab === 'categorias' ? (
          <CategoriesTab catalog={catalog} setCatalog={setCatalog} notify={notify} />
        ) : tab === 'equipe' ? (
          <TeamTab notify={notify} />
        ) : (
          <SiteImagesTab catalog={catalog} setCatalog={setCatalog} notify={notify} />
        )}
      </main>

      <NoticeToast notice={notice} onClose={dismiss} />
    </div>
  );
}
