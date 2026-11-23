# Full Tech Store — iPhones & Acessórios Celular

Loja virtual em **React + Vite + Tailwind CSS v4 + Lucide Icons**, com **painel da loja** (Supabase) para o lojista editar produtos, preços e fotos sozinho.

## Rodar localmente

```bash
npm install
npm run dev      # http://localhost:5173  ·  painel em http://localhost:5173/#admin
npm run build    # gera /dist para deploy
```

Deploy na Vercel: importar o repositório do GitHub — a Vercel detecta Vite automaticamente (build `npm run build`, saída `dist`).

## Painel da loja (`/#admin`)

- **Configuração (uma vez):** siga o [GUIA-CONFIGURACAO.md](GUIA-CONFIGURACAO.md) — criar projeto no Supabase, rodar `supabase/schema.sql` (mostra o **código de acesso**) e `supabase/seed.sql`, ajustar o login. A conexão já está em `src/config/supabase.ts` (variáveis `VITE_SUPABASE_*` na Vercel são opcionais e têm prioridade).
- **Cadastro da equipe:** em `/#admin` → **Criar acesso** com e-mail, senha e o código de acesso da loja. A aba **Equipe** do painel mostra/troca o código, copia convites e remove pessoas.
- **Para entregar ao cliente:** [MANUAL-DO-LOJISTA.md](MANUAL-DO-LOJISTA.md).
- **Modo demonstração** (painel salva só no navegador; código `DEMO-1234`): defina `VITE_FORCE_DEMO=1` — útil para apresentar sem mexer nos dados reais.

O que o lojista faz no painel: cadastrar/editar/excluir produtos com foto (tirada do celular), preço ou “sob consulta”, preço “de” (promoção), marcar **esgotado** / **oculto**, escolher os “Mais Vendidos”, editar e reordenar categorias, trocar a imagem do topo e do banner.

## Onde personalizar (código)

| O quê | Arquivo |
| --- | --- |
| Cores e fontes | `src/index.css` → bloco `@theme` (`--color-brand`, `--color-ink`, …) |
| Nome, textos do topo/banner, Instagram, WhatsApp, horário | `src/config/site.ts` |
| Logo | `src/components/ui/Logo.tsx` |
| Dados iniciais (modo demonstração e `seed.sql`) | `src/data/products.ts`, `src/data/categories.ts` |
| Imagens que vêm com o site | `public/images/…` |

WhatsApp da loja: `whatsapp` em `src/config/site.ts` (hoje +55 61 9608-9741). "Gerar pedido" abre esse WhatsApp com o pedido escrito (itens, total, pagamento, retirada ou endereço de entrega); "Consultar" e "Avise-me quando chegar" também.

## Estrutura

```
src/
  config/site.ts            configurações da loja
  data/                     dados iniciais (seed)
  lib/api.ts                Supabase ou modo demonstração
  lib/supabaseApi.ts        leitura/escrita no Supabase + fotos
  lib/demoApi.ts            modo demonstração (localStorage)
  lib/image.ts              compressão de fotos antes do envio
  context/                  catálogo, carrinho e navegação
  components/               layout, seções, overlays, UI
  pages/ShopPage.tsx        loja com filtros, busca e ordenação
  admin/                    painel (carregado só em /#admin)
supabase/
  schema.sql                tabelas, segurança (RLS), bucket de imagens
  seed.sql                  produtos e categorias iniciais
```

Navegação por hash: `#shop`, `#deals`, `#shop-capinhas`, `#admin`.
