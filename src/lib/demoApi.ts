import { categories as seedCategories } from '../data/categories';
import { products as seedProducts } from '../data/products';
import type { Api, Catalog } from './api';

/**
 * MODO DEMONSTRAÇÃO — sem Supabase.
 * Guarda tudo no navegador (localStorage). Serve para apresentar o painel ao cliente
 * e para testar; não é compartilhado entre aparelhos.
 */
const DB_KEY = 'fulltech-demo-db';
const SESSION_KEY = 'fulltech-demo-session';
const TEAM_KEY = 'fulltech-demo-team';
const CODE_KEY = 'fulltech-demo-code';
/** Código de acesso do modo demonstração. */
export const DEMO_ACCESS_CODE = 'DEMO-1234';

type DemoMember = { userId: string; email: string; createdAt: string; isAdmin: boolean };

const ls = {
  get<T>(k: string, fb: T): T {
    try {
      const v = localStorage.getItem(k);
      return v ? (JSON.parse(v) as T) : fb;
    } catch {
      return fb;
    }
  },
  set(k: string, v: unknown) {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch {
      /* ignora */
    }
  },
};
const team = () => ls.get<DemoMember[]>(TEAM_KEY, []);
const accessCode = () => ls.get<string>(CODE_KEY, DEMO_ACCESS_CODE);
const currentEmail = () => ls.get<string | null>(SESSION_KEY, null);
const upsertMember = (email: string, isAdmin: boolean) => {
  const list = team();
  const found = list.find((m) => m.email.toLowerCase() === email.toLowerCase());
  if (found) found.isAdmin = found.isAdmin || isAdmin;
  else list.push({ userId: `u-${Date.now()}`, email, createdAt: new Date().toISOString(), isAdmin });
  ls.set(TEAM_KEY, list);
  return list.find((m) => m.email.toLowerCase() === email.toLowerCase())!;
};

const seed = (): Catalog => ({
  categories: seedCategories.map((c, i) => ({ ...c, position: i })),
  products: seedProducts.map((p, i) => ({ ...p, status: p.status ?? 'ativo', position: i })),
  settings: {},
});

function read(): Catalog {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw) as Catalog;
  } catch {
    /* sem armazenamento — usa os dados iniciais */
  }
  return seed();
}

function write(db: Catalog) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch {
    throw new Error('O espaço do modo demonstração acabou (as fotos ficam guardadas no navegador). Configure o Supabase para uso real.');
  }
}

const wait = (ms = 120) => new Promise((r) => setTimeout(r, ms));

const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = () => reject(new Error('Não foi possível ler a imagem.'));
    fr.readAsDataURL(blob);
  });

export function createDemoApi(): Api {
  return {
    mode: 'demo',

    async loadCatalog(includeHidden = false) {
      const db = read();
      return {
        ...db,
        products: includeHidden ? db.products : db.products.filter((p) => p.status !== 'oculto'),
      };
    },

    async getSession() {
      const email = currentEmail();
      if (!email) return null;
      const m = team().find((x) => x.email.toLowerCase() === email.toLowerCase());
      return { email, isAdmin: m ? m.isAdmin : true };
    },

    // No modo demonstração, "Entrar" aceita qualquer e-mail/senha (para apresentar o painel).
    async signIn(email, password) {
      await wait(300);
      if (!email || !password) throw new Error('Informe e-mail e senha.');
      const known = team().find((x) => x.email.toLowerCase() === email.toLowerCase());
      const m = known ?? upsertMember(email, true);
      ls.set(SESSION_KEY, email);
      return { email, isAdmin: m.isAdmin };
    },

    async signUp(email, password, code) {
      await wait(400);
      if (!email || password.length < 8) throw new Error('Use uma senha com pelo menos 8 caracteres.');
      if (team().some((x) => x.email.toLowerCase() === email.toLowerCase())) throw new Error('Este e-mail já tem cadastro. Use “Entrar”.');
      const ok = code.trim().toUpperCase() === accessCode().toUpperCase();
      upsertMember(email, ok);
      ls.set(SESSION_KEY, email);
      return { session: { email, isAdmin: ok }, needsConfirmation: false };
    },

    async claimAdmin(code) {
      await wait(300);
      const email = currentEmail();
      if (!email) throw new Error('Sua sessão expirou. Entre novamente.');
      if (code.trim().toUpperCase() !== accessCode().toUpperCase()) throw new Error('Código de acesso inválido. Confira com o responsável pelo site.');
      upsertMember(email, true);
    },

    async signOut() {
      try {
        localStorage.removeItem(SESSION_KEY);
      } catch {
        /* ignora */
      }
    },

    async listTeam() {
      await wait();
      const me = currentEmail()?.toLowerCase();
      return team()
        .filter((m) => m.isAdmin)
        .map((m) => ({ userId: m.userId, email: m.email, createdAt: m.createdAt, isMe: m.email.toLowerCase() === me }));
    },

    async removeTeamMember(userId) {
      await wait();
      const list = team();
      if (list.filter((m) => m.isAdmin).length <= 1) throw new Error('Não é possível remover o último administrador.');
      ls.set(TEAM_KEY, list.map((m) => (m.userId === userId ? { ...m, isAdmin: false } : m)));
    },

    async getAccessCode() {
      return accessCode();
    },

    async setAccessCode(code) {
      await wait();
      if (code.trim().length < 8) throw new Error('O código precisa ter pelo menos 8 caracteres.');
      ls.set(CODE_KEY, code.trim());
    },

    async saveProduct(p, isNew) {
      await wait();
      const db = read();
      if (isNew) {
        if (db.products.some((x) => x.id === p.id)) throw new Error('Já existe um produto com esse identificador.');
        db.products.push(p);
      } else {
        db.products = db.products.map((x) => (x.id === p.id ? p : x));
      }
      write(db);
      return p;
    },

    async deleteProduct(id) {
      await wait();
      const db = read();
      db.products = db.products.filter((p) => p.id !== id);
      write(db);
    },

    async saveCategory(c, isNew) {
      await wait();
      const db = read();
      if (isNew) {
        if (db.categories.some((x) => x.slug === c.slug)) throw new Error('Já existe uma categoria com esse nome.');
        db.categories.push(c);
      } else {
        db.categories = db.categories.map((x) => (x.slug === c.slug ? c : x));
      }
      write(db);
      return c;
    },

    async deleteCategory(slug) {
      await wait();
      const db = read();
      if (db.products.some((p) => p.category === slug)) throw new Error('Esta categoria ainda tem produtos. Mova ou apague os produtos antes.');
      db.categories = db.categories.filter((c) => c.slug !== slug);
      write(db);
    },

    async saveSettings(settings) {
      await wait();
      const db = read();
      db.settings = { ...db.settings, ...settings };
      write(db);
    },

    async uploadImage(file) {
      await wait(250);
      return blobToDataUrl(file);
    },

    async removeImage() {
      /* no modo demonstração a imagem some junto com o produto */
    },
  };
}
