/**
 * CAMADA DE DADOS
 * - Usa o Supabase configurado em src/config/supabase.ts (ou nas variáveis VITE_SUPABASE_* da Vercel).
 * - Sem URL/chave (ou com VITE_FORCE_DEMO=1) → MODO DEMONSTRAÇÃO: os dados ficam salvos só neste navegador.
 */
import type { Category } from '../data/categories';
import type { Product } from '../data/products';
import { createDemoApi } from './demoApi';
import { createSupabaseApi } from './supabaseApi';
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from '../config/supabase';

export interface SiteSettings {
  heroImage: string;
  promoImage: string;
}

export interface Catalog {
  categories: Category[];
  products: Product[];
  settings: Partial<SiteSettings>;
}

export interface AdminSession {
  email: string;
  /** false = conta existe, mas ainda não informou o código de acesso da loja */
  isAdmin: boolean;
}

export interface TeamMember {
  userId: string;
  email: string;
  createdAt: string;
  isMe: boolean;
}

export interface Api {
  mode: 'supabase' | 'demo';
  /** includeHidden = true só no painel (mostra produtos ocultos). */
  loadCatalog(includeHidden?: boolean): Promise<Catalog>;
  getSession(): Promise<AdminSession | null>;
  signIn(email: string, password: string): Promise<AdminSession>;
  /** Cria a conta. Com o código certo, já entra como administrador. */
  signUp(email: string, password: string, accessCode: string): Promise<{ session: AdminSession | null; needsConfirmation: boolean }>;
  /** Conta já logada informa o código de acesso. */
  claimAdmin(accessCode: string): Promise<void>;
  signOut(): Promise<void>;
  listTeam(): Promise<TeamMember[]>;
  removeTeamMember(userId: string): Promise<void>;
  getAccessCode(): Promise<string>;
  setAccessCode(code: string): Promise<void>;
  saveProduct(product: Product, isNew: boolean): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  saveCategory(category: Category, isNew: boolean): Promise<Category>;
  deleteCategory(slug: string): Promise<void>;
  saveSettings(settings: Partial<SiteSettings>): Promise<void>;
  /** Envia uma imagem e devolve a URL pública. */
  uploadImage(file: Blob, folder: string): Promise<string>;
  /** Apaga uma imagem enviada pelo painel (ignora imagens que vieram com o site). */
  removeImage(url: string): Promise<void>;
}

const env = import.meta.env as Record<string, string | undefined>;
const URL_ = (env.VITE_SUPABASE_URL || SUPABASE_URL)?.trim();
// Chave pública (sb_publishable_…). A antiga chave "anon" também funciona, mas está sendo descontinuada.
const KEY_ = (env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY || SUPABASE_PUBLISHABLE_KEY)?.trim();
const FORCE_DEMO = env.VITE_FORCE_DEMO === '1';

function createApi(): Api {
  if (FORCE_DEMO || !URL_ || !KEY_) return createDemoApi();
  try {
    return createSupabaseApi(URL_, KEY_);
  } catch (e) {
    // Sem a biblioteca do Supabase (ex.: sem internet) → o site mostra a mensagem de erro em vez de quebrar.
    return createUnavailableApi((e as Error).message || 'Sem conexão com o servidor.');
  }
}

function createUnavailableApi(message: string): Api {
  const fail = async () => {
    throw new Error(message);
  };
  return {
    mode: 'supabase',
    loadCatalog: fail,
    getSession: async () => null,
    signIn: fail,
    signUp: fail,
    claimAdmin: fail,
    signOut: async () => undefined,
    listTeam: fail,
    removeTeamMember: fail,
    getAccessCode: fail,
    setAccessCode: fail,
    saveProduct: fail,
    deleteProduct: fail,
    saveCategory: fail,
    deleteCategory: fail,
    saveSettings: fail,
    uploadImage: fail,
    removeImage: async () => undefined,
  };
}

export const api: Api = createApi();

/** Normaliza a lista de produtos para o site público. */
export function sortProducts(list: Product[]) {
  return [...list].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
}
