import { createClient } from '@supabase/supabase-js';
import type { Category } from '../data/categories';
import type { Product, ProductStatus } from '../data/products';
import type { AdminSession, Api, Catalog, SiteSettings } from './api';

const BUCKET = 'images';

type ProductRow = {
  id: string;
  name: string;
  variant: string | null;
  category: string;
  price: number | string | null;
  old_price: number | string | null;
  image_url: string | null;
  featured: boolean;
  status: ProductStatus;
  description: string | null;
  features: string[] | null;
  position: number | null;
};

type CategoryRow = { slug: string; name: string; image_url: string | null; position: number | null };

const num = (v: number | string | null) => (v === null || v === undefined ? null : Number(v));

const fromProductRow = (r: ProductRow): Product => ({
  id: r.id,
  name: r.name,
  variant: r.variant ?? '',
  category: r.category,
  price: num(r.price),
  oldPrice: num(r.old_price),
  image: r.image_url ?? '',
  featured: r.featured,
  status: r.status,
  description: r.description ?? '',
  features: r.features ?? [],
  position: r.position ?? 0,
});

const toProductRow = (p: Product) => ({
  name: p.name,
  variant: p.variant,
  category: p.category,
  price: p.price,
  old_price: p.oldPrice ?? null,
  image_url: p.image || null,
  featured: !!p.featured,
  status: p.status ?? 'ativo',
  description: p.description,
  features: p.features,
  position: p.position ?? 0,
});

const fromCategoryRow = (r: CategoryRow): Category => ({
  slug: r.slug,
  name: r.name,
  image: r.image_url ?? '',
  position: r.position ?? 0,
});

const SETTING_KEYS: Record<keyof SiteSettings, string> = { heroImage: 'hero_image', promoImage: 'promo_image' };

/** Traduz os erros mais comuns para mensagens claras ao lojista. */
function friendly(message: string) {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) return 'E-mail ou senha incorretos.';
  if (m.includes('already registered') || m.includes('already been registered')) return 'Este e-mail já tem cadastro. Use “Entrar”.';
  if (m.includes('password should be') || m.includes('weak password')) return 'Senha fraca. Use pelo menos 8 caracteres, com letras e números.';
  if (m.includes('signups not allowed') || m.includes('signup is disabled')) return 'O cadastro está desativado no Supabase (Authentication → Sign In / Providers → “Allow new users to sign up”).';
  if (m.includes('email address not authorized') || m.includes('error sending confirmation')) return 'O Supabase tentou enviar um e-mail de confirmação e não conseguiu. Desative “Confirm email” no Supabase (veja o guia).';
  if (m.includes('rate limit')) return 'Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.';
  if (m.includes('ultimo administrador') || m.includes('último administrador')) return 'Não é possível remover o último administrador.';
  if (m.includes('pelo menos 8')) return 'O código precisa ter pelo menos 8 caracteres.';
  if (m.includes('email not confirmed')) return 'Este e-mail ainda não foi confirmado no Supabase.';
  if (m.includes('foreign key') || m.includes('violates')) return 'Esta categoria ainda tem produtos. Mova ou apague os produtos antes.';
  if (m.includes('duplicate key')) return 'Já existe um item com esse nome/identificador.';
  if (m.includes('row-level security') || m.includes('permission')) return 'Sem permissão. Entre novamente com um usuário administrador.';
  if (m.includes('failed to fetch') || m.includes('network')) return 'Sem conexão com o servidor. Verifique a internet e tente de novo.';
  if (m.includes('jwt') || m.includes('expired')) return 'Sua sessão expirou. Entre novamente.';
  return message;
}

function check<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new Error(friendly(res.error.message));
  return res.data;
}

export function createSupabaseApi(url: string, key: string): Api {
  const sb = createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true } });

  const isAdmin = async (userId: string) => {
    const { data, error } = await sb.from('admins').select('user_id').eq('user_id', userId).maybeSingle();
    return !error && !!data;
  };

  return {
    mode: 'supabase',

    async loadCatalog(includeHidden = false): Promise<Catalog> {
      const [cats, prods, sets] = await Promise.all([
        sb.from('categories').select('*').order('position', { ascending: true }),
        sb.from('products').select('*').order('position', { ascending: true }).order('created_at', { ascending: false }),
        sb.from('site_settings').select('*'),
      ]);
      const categories = check(cats as { data: CategoryRow[]; error: { message: string } | null }).map(fromCategoryRow);
      let products = check(prods as { data: ProductRow[]; error: { message: string } | null }).map(fromProductRow);
      if (!includeHidden) products = products.filter((p) => p.status !== 'oculto');
      const rows = check(sets as { data: { key: string; value: string | null }[]; error: { message: string } | null });
      const get = (k: string) => rows.find((r) => r.key === k)?.value || undefined;
      return { categories, products, settings: { heroImage: get('hero_image'), promoImage: get('promo_image') } };
    },

    async getSession() {
      const { data } = await sb.auth.getSession();
      const user = data.session?.user;
      if (!user) return null;
      return { email: user.email ?? 'admin', isAdmin: await isAdmin(user.id) };
    },

    async signIn(email, password) {
      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw new Error(friendly(error.message));
      return { email: data.user.email ?? email, isAdmin: await isAdmin(data.user.id) };
    },

    async signUp(email, password, accessCode) {
      const { data, error } = await sb.auth.signUp({
        email,
        password,
        options: { data: { access_code: accessCode.trim() } },
      });
      if (error) throw new Error(friendly(error.message));
      // Supabase devolve usuário "fantasma" sem identidades quando o e-mail já existe.
      if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        throw new Error('Este e-mail já tem cadastro. Use “Entrar”.');
      }
      if (!data.session || !data.user) return { session: null, needsConfirmation: true };
      const session: AdminSession = { email: data.user.email ?? email, isAdmin: await isAdmin(data.user.id) };
      return { session, needsConfirmation: false };
    },

    async claimAdmin(accessCode) {
      const { data, error } = await sb.rpc('claim_admin', { code: accessCode.trim() });
      if (error) throw new Error(friendly(error.message));
      if (data === 'invalid') throw new Error('Código de acesso inválido. Confira com o responsável pelo site.');
      if (data === 'limit') throw new Error('Muitas tentativas. Aguarde 1 hora e tente de novo.');
      if (data === 'login') throw new Error('Sua sessão expirou. Entre novamente.');
    },

    async listTeam() {
      const [{ data, error }, { data: auth }] = await Promise.all([sb.rpc('list_admins'), sb.auth.getUser()]);
      if (error) throw new Error(friendly(error.message));
      const me = auth.user?.id;
      return ((data ?? []) as { user_id: string; email: string; created_at: string }[]).map((r) => ({
        userId: r.user_id,
        email: r.email,
        createdAt: r.created_at,
        isMe: r.user_id === me,
      }));
    },

    async removeTeamMember(userId) {
      const { error } = await sb.rpc('remove_admin', { target: userId });
      if (error) throw new Error(friendly(error.message));
    },

    async getAccessCode() {
      const { data, error } = await sb.rpc('get_access_code');
      if (error) throw new Error(friendly(error.message));
      return (data as string | null) ?? '';
    },

    async setAccessCode(code) {
      const { error } = await sb.rpc('set_access_code', { new_code: code.trim() });
      if (error) throw new Error(friendly(error.message));
    },

    async signOut() {
      await sb.auth.signOut();
    },

    async saveProduct(p, isNew) {
      const row = toProductRow(p);
      const res = isNew
        ? await sb.from('products').insert({ id: p.id, ...row }).select().single()
        : await sb.from('products').update(row).eq('id', p.id).select().single();
      return fromProductRow(check(res as { data: ProductRow; error: { message: string } | null }));
    },

    async deleteProduct(id) {
      check(await sb.from('products').delete().eq('id', id));
    },

    async saveCategory(c, isNew) {
      const row = { name: c.name, image_url: c.image || null, position: c.position ?? 0 };
      const res = isNew
        ? await sb.from('categories').insert({ slug: c.slug, ...row }).select().single()
        : await sb.from('categories').update(row).eq('slug', c.slug).select().single();
      return fromCategoryRow(check(res as { data: CategoryRow; error: { message: string } | null }));
    },

    async deleteCategory(slug) {
      check(await sb.from('categories').delete().eq('slug', slug));
    },

    async saveSettings(settings) {
      const rows = (Object.keys(settings) as (keyof SiteSettings)[])
        .filter((k) => settings[k] !== undefined)
        .map((k) => ({ key: SETTING_KEYS[k], value: settings[k] ?? null }));
      if (rows.length) check(await sb.from('site_settings').upsert(rows, { onConflict: 'key' }));
    },

    async uploadImage(file, folder) {
      const ext = file.type === 'image/webp' ? 'webp' : file.type === 'image/png' ? 'png' : 'jpg';
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await sb.storage.from(BUCKET).upload(path, file, {
        contentType: file.type || 'image/jpeg',
        cacheControl: '31536000',
        upsert: false,
      });
      if (error) throw new Error(friendly(error.message));
      return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    },

    async removeImage(imageUrl) {
      const marker = `/storage/v1/object/public/${BUCKET}/`;
      const i = imageUrl.indexOf(marker);
      if (i === -1) return;
      await sb.storage.from(BUCKET).remove([decodeURIComponent(imageUrl.slice(i + marker.length))]);
    },
  };
}
