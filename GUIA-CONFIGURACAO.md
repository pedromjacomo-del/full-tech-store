# Guia de configuração — Painel da loja (Supabase + Vercel)

Tempo estimado: **20–30 minutos**, uma única vez. Depois disso, a loja edita produtos, preços e fotos sozinha em **`seusite.com.br/#admin`**.

> Sem as variáveis do Supabase o site funciona em **modo demonstração**: o painel abre com qualquer e-mail/senha e as alterações ficam só no navegador de quem editou. Bom para apresentar ao cliente; **não** serve para uso real.

---

## 1. Criar o projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) → **New project**.
   - Dica: crie a conta/organização no **e-mail da loja** e adicione você como membro. Assim o cliente é dono dos dados.
2. Nome: `full-tech-store` · Região: **South America (São Paulo)** · defina uma senha forte para o banco (guarde-a).
3. Espere o projeto terminar de criar (1–2 min).

## 2. Criar as tabelas e regras de segurança

1. No menu lateral: **SQL Editor → New query**.
2. Cole todo o conteúdo de [`supabase/schema.sql`](supabase/schema.sql) e clique **Run**.
   - No fim, em **Results**, aparece o **`codigo_de_acesso_da_loja`** (ex.: `FT-7K2Q-91XB-M4CZ`). **Anote** — é com ele que o dono cria o acesso ao painel.
   - Já tinha rodado uma versão anterior? Rode o arquivo inteiro de novo: ele só acrescenta o que falta.
3. Nova query → cole [`supabase/seed.sql`](supabase/seed.sql) → **Run**. Isso carrega as categorias, produtos e imagens que já estão no site.

O que o `schema.sql` cria:

| Item | Para quê |
| --- | --- |
| `categories`, `products` | Catálogo da loja |
| `site_settings` | Imagem do topo e do banner |
| `admins` | Quem pode editar |
| Código de acesso (área privada) | Quem se cadastra com ele vira administrador automaticamente |
| Políticas RLS | Visitantes **só leem**; só administradores **escrevem**. Produtos “ocultos” não aparecem para visitantes |
| Bucket `images` | Fotos enviadas pelo painel (público para leitura, só admin envia/apaga) |

## 3. Ajustar o login (Authentication)

Em **Authentication → Sign In / Providers**:

1. **Allow new users to sign up** → **ligado** (o cadastro é feito pelo próprio site, em “Criar acesso”).
2. Em **Email**, desligue **Confirm email** e salve.
   > Por quê: sem um servidor de e-mail próprio, o Supabase só entrega e-mails para membros da equipe do projeto — o e-mail de confirmação não chegaria ao dono da loja. A segurança fica por conta do **código de acesso**: sem ele, a pessoa até cria uma conta, mas não consegue editar nada.
   > Se um dia configurar um SMTP próprio (Authentication → Emails → SMTP Settings), pode religar.

**Como o dono cria o acesso dele**

1. Abre `seusite.com.br/#admin` (ou **“Área da loja”** no rodapé) → **Criar acesso**.
2. Informa e-mail, cria uma senha e digita o **código de acesso** (passo 2).
3. Pronto: já entra no painel. Na aba **Equipe** ele vê o código, pode **copiar um convite** para funcionários, **gerar um código novo** e **remover** pessoas.

> Recomendação: depois que todos criarem o acesso, gere um código novo na aba **Equipe** — quem já está na equipe continua entrando normalmente.

**Esqueceu o código?** Rode no SQL Editor: `select value from private.settings where key = 'admin_access_code';`

## 4. Ligar o site ao Supabase

> ✅ **Já feito neste projeto:** a URL e a chave publishable do projeto "full tech store" estão em `src/config/supabase.ts`. Não precisa cadastrar variáveis na Vercel — é só publicar.
> Os passos abaixo só são necessários se um dia você trocar de projeto do Supabase (as variáveis da Vercel têm prioridade sobre o arquivo).

1. No Supabase: **Project Settings → API Keys**. Copie:
   - **Project URL** (ex.: `https://abcd1234.supabase.co`, também aparece em *Data API*)
   - **Publishable key** (`sb_publishable_…`)
   > ⚠️ Nunca use a **secret key** (`sb_secret_…`) nem a `service_role` no site.
2. Na Vercel: **Project → Settings → Environment Variables**, adicione (Production, Preview e Development):

| Nome | Valor |
| --- | --- |
| `VITE_SUPABASE_URL` | Project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Publishable key |

3. **Deployments → ⋯ → Redeploy** (as variáveis só entram num novo build).

Para rodar no seu computador: copie `.env.example` para `.env.local`, preencha e rode `npm install && npm run dev`.

## 5. Testar

1. Abra `seusite.com.br/#admin` → **Criar acesso** com o código do passo 2.
2. O aviso amarelo de “modo demonstração” **não** deve aparecer.
3. Marque um produto como **Esgotou** → abra o site em outra aba → ele aparece com o selo “Esgotado”.

Também existe o link discreto **“Área da loja”** no rodapé do site.

---

## Planos e custos

- **Supabase Free**: suficiente para o catálogo e as fotos de uma loja, mas **projetos gratuitos pausam após 7 dias sem atividade**. Para um site em produção, use o **Pro (US$ 25/mês)**, que não pausa — e inclua esse custo na mensalidade do cliente.
- **Vercel**: o plano atual continua igual (o painel faz parte do mesmo site).

## Manutenção

- **Backup**: no plano Pro o Supabase faz backups diários. Para uma cópia manual: *Database → Backups* ou exporte as tabelas em *Table Editor → Export to CSV*.
- **Fotos**: o painel reduz e comprime as fotos automaticamente (fotos de celular de 5 MB viram ~100–200 KB) e apaga do armazenamento as fotos substituídas.
- **Novos administradores**: aba **Equipe** do painel → **Copiar convite** → enviar pelo WhatsApp.
- **Remover alguém**: aba **Equipe** → lixeira (o último administrador não pode ser removido).
- **Esqueceu a senha**: no Supabase, *Authentication → Users* → clique no usuário → defina uma nova senha (o envio de e-mail de recuperação depende de SMTP próprio).

## Como funciona (para desenvolvedores)

```
src/lib/api.ts           → escolhe Supabase (com variáveis) ou modo demonstração (sem)
src/lib/supabaseApi.ts   → leitura/escrita no Supabase + upload no bucket "images"
src/lib/demoApi.ts       → mesma interface, salvando no localStorage
src/lib/image.ts         → redimensiona/comprime fotos antes do envio (WebP/JPEG)
src/context/CatalogContext.tsx → o site lê categorias, produtos e imagens daqui
src/admin/*              → painel (carregado só quando alguém abre /#admin)
supabase/schema.sql      → tabelas, RLS, bucket
supabase/seed.sql        → dados iniciais (gerado a partir de src/data)
```

Os arquivos `src/data/products.ts` e `src/data/categories.ts` agora são só os **dados iniciais** (modo demonstração e seed). Com o Supabase ligado, a fonte da verdade é o banco.
