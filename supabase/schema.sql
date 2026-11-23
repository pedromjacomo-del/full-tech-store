-- =============================================================
--  FULL TECH STORE — ESTRUTURA DO BANCO (Supabase / Postgres)
--  Rode este arquivo inteiro no Supabase: SQL Editor → New query → Run.
--  Pode rodar de novo sem problema (é idempotente).
-- =============================================================

-- ---------- Tabelas ----------

create table if not exists public.categories (
  slug        text primary key,
  name        text not null,
  image_url   text,
  position    int  not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists public.products (
  id           text primary key default gen_random_uuid()::text,
  name         text not null,
  variant      text not null default '',
  category     text not null references public.categories (slug) on update cascade on delete restrict,
  price        numeric(10, 2),            -- null = "Sob consulta"
  old_price    numeric(10, 2),            -- preço "de" (riscado)
  image_url    text,
  featured     boolean not null default false,  -- aparece em "Mais Vendidos"
  status       text not null default 'ativo' check (status in ('ativo', 'esgotado', 'oculto')),
  description  text not null default '',
  features     text[] not null default '{}',
  position     int  not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category);
create index if not exists products_position_idx on public.products (position);

-- Configurações do site (imagens do topo e do banner)
create table if not exists public.site_settings (
  key         text primary key,
  value       text,
  updated_at  timestamptz not null default now()
);

-- Quem pode editar a loja (usuários do Supabase Auth)
create table if not exists public.admins (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now()
);

-- ---------- Funções auxiliares ----------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

drop trigger if exists settings_touch on public.site_settings;
create trigger settings_touch before update on public.site_settings
  for each row execute function public.touch_updated_at();

-- ---------- Permissões de acesso pela API ----------
-- (Projetos novos podem vir sem essas permissões; as regras abaixo do RLS continuam valendo.)

grant usage on schema public to anon, authenticated;
grant select on public.categories, public.products, public.site_settings to anon, authenticated;
grant insert, update, delete on public.categories, public.products, public.site_settings to authenticated;
grant select on public.admins to authenticated;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------- Segurança (Row Level Security) ----------
-- Visitantes: só leitura (produtos "oculto" não aparecem).
-- Administradores: leitura e escrita.

alter table public.categories    enable row level security;
alter table public.products      enable row level security;
alter table public.site_settings enable row level security;
alter table public.admins        enable row level security;

drop policy if exists "categorias: leitura pública" on public.categories;
create policy "categorias: leitura pública" on public.categories
  for select using (true);
drop policy if exists "categorias: admin escreve" on public.categories;
create policy "categorias: admin escreve" on public.categories
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "produtos: leitura pública" on public.products;
create policy "produtos: leitura pública" on public.products
  for select using (status <> 'oculto' or public.is_admin());
drop policy if exists "produtos: admin escreve" on public.products;
create policy "produtos: admin escreve" on public.products
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "config: leitura pública" on public.site_settings;
create policy "config: leitura pública" on public.site_settings
  for select using (true);
drop policy if exists "config: admin escreve" on public.site_settings;
create policy "config: admin escreve" on public.site_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins: vê o próprio registro" on public.admins;
create policy "admins: vê o próprio registro" on public.admins
  for select to authenticated using (user_id = auth.uid());

-- ---------- Armazenamento de imagens ----------
-- Bucket público "images": qualquer um vê as fotos, só admin envia/troca/apaga.

insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do update set public = true;

drop policy if exists "imagens: admin lista" on storage.objects;
create policy "imagens: admin lista" on storage.objects
  for select to authenticated using (bucket_id = 'images' and public.is_admin());
drop policy if exists "imagens: admin envia" on storage.objects;
create policy "imagens: admin envia" on storage.objects
  for insert to authenticated with check (bucket_id = 'images' and public.is_admin());
drop policy if exists "imagens: admin atualiza" on storage.objects;
create policy "imagens: admin atualiza" on storage.objects
  for update to authenticated using (bucket_id = 'images' and public.is_admin());
drop policy if exists "imagens: admin apaga" on storage.objects;
create policy "imagens: admin apaga" on storage.objects
  for delete to authenticated using (bucket_id = 'images' and public.is_admin());

-- =============================================================
--  CADASTRO DA EQUIPE PELO PRÓPRIO SITE (código de acesso)
--  Quem se cadastra em /#admin com o CÓDIGO DE ACESSO vira administrador.
--  Sem o código, a conta é criada mas não consegue editar nada.
-- =============================================================

-- Área privada: não é exposta pela API do site.
create schema if not exists private;
revoke all on schema private from anon, authenticated;

create table if not exists private.settings (
  key    text primary key,
  value  text not null
);

create table if not exists private.claim_attempts (
  user_id  uuid not null,
  at       timestamptz not null default now()
);
create index if not exists claim_attempts_user_idx on private.claim_attempts (user_id, at);

-- Gera um código de acesso aleatório na primeira vez (ex.: FT-7K2Q-91XB-M4CZ).
insert into private.settings (key, value)
values (
  'admin_access_code',
  'FT-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 4))
  || '-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 4))
  || '-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 4))
)
on conflict (key) do nothing;

-- Cadastro com código válido → vira administrador automaticamente.
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
declare
  expected text;
  given    text := upper(trim(coalesce(new.raw_user_meta_data ->> 'access_code', '')));
begin
  if given <> '' then
    select value into expected from private.settings where key = 'admin_access_code';
    if expected is not null and given = upper(expected) then
      insert into public.admins (user_id) values (new.id) on conflict do nothing;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_admin on auth.users;
create trigger on_auth_user_created_admin
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- Conta já existente informa o código depois de entrar (máx. 5 tentativas por hora).
create or replace function public.claim_admin(code text)
returns text
language plpgsql
security definer
set search_path = public, private
as $$
declare
  uid      uuid := auth.uid();
  expected text;
  recent   int;
begin
  if uid is null then return 'login'; end if;
  if exists (select 1 from public.admins where user_id = uid) then return 'ok'; end if;
  select count(*) into recent from private.claim_attempts where user_id = uid and at > now() - interval '1 hour';
  if recent >= 5 then return 'limit'; end if;
  insert into private.claim_attempts (user_id) values (uid);
  select value into expected from private.settings where key = 'admin_access_code';
  if expected is null or upper(trim(coalesce(code, ''))) <> upper(expected) then return 'invalid'; end if;
  insert into public.admins (user_id) values (uid) on conflict do nothing;
  return 'ok';
end;
$$;

-- Lista a equipe (só para administradores).
create or replace function public.list_admins()
returns table (user_id uuid, email text, created_at timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select a.user_id, u.email::text, a.created_at
  from public.admins a
  join auth.users u on u.id = a.user_id
  where public.is_admin()
  order by a.created_at;
$$;

-- Remove alguém da equipe (nunca o último administrador).
create or replace function public.remove_admin(target uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'Sem permissão.'; end if;
  if (select count(*) from public.admins) <= 1 then
    raise exception 'Não é possível remover o último administrador.';
  end if;
  delete from public.admins where user_id = target;
end;
$$;

-- Ver e trocar o código de acesso (só para administradores).
create or replace function public.get_access_code()
returns text
language sql
stable
security definer
set search_path = public, private
as $$
  select case when public.is_admin()
    then (select value from private.settings where key = 'admin_access_code') end;
$$;

create or replace function public.set_access_code(new_code text)
returns void
language plpgsql
security definer
set search_path = public, private
as $$
begin
  if not public.is_admin() then raise exception 'Sem permissão.'; end if;
  if length(trim(coalesce(new_code, ''))) < 8 then
    raise exception 'O código precisa ter pelo menos 8 caracteres.';
  end if;
  insert into private.settings (key, value) values ('admin_access_code', trim(new_code))
  on conflict (key) do update set value = excluded.value;
end;
$$;

revoke all on function public.claim_admin(text)      from public, anon;
revoke all on function public.list_admins()          from public, anon;
revoke all on function public.remove_admin(uuid)     from public, anon;
revoke all on function public.get_access_code()      from public, anon;
revoke all on function public.set_access_code(text)  from public, anon;
grant execute on function public.claim_admin(text)     to authenticated;
grant execute on function public.list_admins()         to authenticated;
grant execute on function public.remove_admin(uuid)    to authenticated;
grant execute on function public.get_access_code()     to authenticated;
grant execute on function public.set_access_code(text) to authenticated;

-- ---------- Mostra o código de acesso atual (aparece em "Results" após o Run) ----------
select value as codigo_de_acesso_da_loja from private.settings where key = 'admin_access_code';
