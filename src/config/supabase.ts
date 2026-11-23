/**
 * CONEXÃO COM O SUPABASE (projeto "full tech store")
 * A chave "publishable" é pública por natureza: pode ficar no código do site.
 * A segurança vem das regras (RLS) do banco. NUNCA coloque aqui a chave "secret" (sb_secret_…).
 *
 * Para usar outro projeto, troque os valores abaixo ou defina na Vercel:
 *   VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY  (têm prioridade sobre estes valores)
 */
export const SUPABASE_URL = 'https://bwzqrvciylwsieiwfaed.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_BzyCE8yiq8NelvQ3uRg9Sg_syZYdDVx';
