-- =============================================================
--  FULL TECH STORE — DADOS INICIAIS
--  Rode DEPOIS do schema.sql. Carrega as categorias, os produtos
--  e as imagens que já estão no site. Pode rodar de novo: atualiza.
-- =============================================================

insert into public.categories (slug, name, image_url, position) values
  ('iphones', 'iPhones', 'images/categories/iphones.webp', 0),
  ('capinhas', 'Capinhas', 'images/categories/capinhas.webp', 1),
  ('peliculas', 'Películas', 'images/categories/peliculas.webp', 2),
  ('fones', 'Fones', 'images/categories/fones.webp', 3),
  ('carregadores-cabos', 'Carregadores & Cabos', 'images/categories/carregadores-cabos.webp', 4),
  ('acessorios', 'Acessórios', 'images/categories/acessorios.webp', 5)
on conflict (slug) do update set name = excluded.name, image_url = excluded.image_url, position = excluded.position;

insert into public.products (id, name, variant, category, price, old_price, image_url, featured, status, description, features, position) values
  ('iphone-17-pro-max', 'iPhone 17 Pro Max', 'Consulte cores', 'iphones', null, null, 'images/products/iphone-17-pro-max.svg', true, 'ativo', 'Consulte cores, capacidades e condições de pagamento com a nossa equipe.', array['Atendimento na loja ou pelo WhatsApp', 'Pagamento em Pix ou cartão', 'Capinhas e películas para o seu modelo']::text[], 0),
  ('capinha-magsafe-transparente', 'Capinha MagSafe', 'Transparente', 'capinhas', 129.9, 159.9, 'images/products/case-magsafe.svg', true, 'ativo', 'Capinha transparente com ímãs MagSafe, compatível com carregadores, carteiras e suportes magnéticos.', array['Ímãs MagSafe', 'Bordas elevadas para câmera e tela', 'Fundo transparente', 'Disponível para vários modelos de iPhone']::text[], 1),
  ('pelicula-vidro-3d', 'Película de Vidro', 'Aplicada na loja', 'peliculas', 59.9, 79.9, 'images/products/glass-tempered.svg', true, 'ativo', 'Película de vidro temperado que cobre a tela inteira, aplicada pela nossa equipe na hora.', array['Vidro temperado', 'Cobertura total da tela', 'Aplicação na loja', 'Compatível com capinha']::text[], 2),
  ('fone-bluetooth', 'Fone Bluetooth', 'Com estojo de carga', 'fones', 199.9, 249.9, 'images/products/earbuds.svg', true, 'ativo', 'Fone sem fio com estojo de carregamento, controles por toque e conexão Bluetooth.', array['Bluetooth', 'Estojo de carregamento', 'Controle por toque', 'Microfone para chamadas']::text[], 3),
  ('fonte-20w-usbc', 'Fonte 20W', 'USB-C', 'carregadores-cabos', 99.9, 129.9, 'images/products/charger-20w.svg', true, 'ativo', 'Carregador de parede USB-C de 20W para carregamento rápido do iPhone.', array['20W USB-C', 'Carregamento rápido', 'Compacta', 'Proteção contra superaquecimento']::text[], 4),
  ('cabo-usbc', 'Cabo USB-C', 'Trançado · 1 m', 'carregadores-cabos', 49.9, null, 'images/products/cable-usbc.svg', true, 'ativo', 'Cabo trançado resistente para carregamento e transferência de dados.', array['Revestimento trançado', 'Carregamento rápido', 'Transferência de dados', '1 metro']::text[], 5),
  ('iphone-17-pro', 'iPhone 17 Pro', 'Consulte cores', 'iphones', null, null, 'images/products/iphone-17-pro.svg', false, 'ativo', 'Consulte cores, capacidades e condições de pagamento com a nossa equipe.', array['Atendimento na loja ou pelo WhatsApp', 'Pagamento em Pix ou cartão', 'Capinhas e películas para o seu modelo']::text[], 6),
  ('iphone-17', 'iPhone 17', 'Consulte cores', 'iphones', null, null, 'images/products/iphone-17.svg', false, 'ativo', 'Consulte cores, capacidades e condições de pagamento com a nossa equipe.', array['Atendimento na loja ou pelo WhatsApp', 'Pagamento em Pix ou cartão', 'Capinhas e películas para o seu modelo']::text[], 7),
  ('iphone-16', 'iPhone 16', 'Consulte cores', 'iphones', null, null, 'images/products/iphone-16.svg', false, 'ativo', 'Consulte cores, capacidades e condições de pagamento com a nossa equipe.', array['Atendimento na loja ou pelo WhatsApp', 'Pagamento em Pix ou cartão', 'Capinhas e películas para o seu modelo']::text[], 8),
  ('capinha-silicone', 'Capinha de Silicone', 'MagSafe · Verde', 'capinhas', 99.9, null, 'images/products/case-silicone-green.svg', false, 'ativo', 'Capinha de silicone com toque macio, forro interno e suporte a MagSafe.', array['Silicone com toque macio', 'Forro interno', 'MagSafe', 'Várias cores']::text[], 9),
  ('capinha-antiimpacto', 'Capinha Anti-impacto', 'Preta', 'capinhas', 89.9, 109.9, 'images/products/case-rugged.svg', false, 'ativo', 'Capinha com cantos reforçados para absorver quedas, com acabamento fosco.', array['Cantos reforçados', 'Acabamento fosco', 'Botões precisos', 'Compatível com carregamento sem fio']::text[], 10),
  ('pelicula-privacidade', 'Película Privacidade', 'Anti-espião', 'peliculas', 79.9, null, 'images/products/glass-privacy.svg', false, 'ativo', 'Deixa a tela visível só para você — quem olha de lado vê a tela escura.', array['Filtro de privacidade', 'Vidro temperado', 'Toque sensível', 'Aplicação na loja']::text[], 11),
  ('headphone-bluetooth', 'Headphone Bluetooth', 'Over-ear', 'fones', 349.9, 399.9, 'images/products/headphones.svg', false, 'ativo', 'Headphone sem fio com almofadas confortáveis para música, chamadas e jogos.', array['Bluetooth', 'Almofadas confortáveis', 'Bateria de longa duração', 'Microfone integrado']::text[], 12),
  ('carregador-sem-fio', 'Carregador sem Fio', '15W', 'carregadores-cabos', 149.9, null, 'images/products/wireless-pad.svg', false, 'ativo', 'Base de carregamento por indução: é só apoiar o celular.', array['Até 15W', 'Funciona com capinha fina', 'Base antiderrapante', 'Indicador de carga']::text[], 13),
  ('power-bank-10000', 'Power Bank', '10.000 mAh', 'acessorios', 199.9, 239.9, 'images/products/power-bank.svg', false, 'ativo', 'Bateria portátil para carregar o celular em qualquer lugar.', array['10.000 mAh', 'Saída USB-C', 'Indicador de bateria', 'Tamanho de bolso']::text[], 14),
  ('suporte-veicular', 'Suporte Veicular', 'Rotação 360°', 'acessorios', 89.9, null, 'images/products/car-mount.svg', false, 'ativo', 'Suporte para painel ou para-brisa com garras ajustáveis e rotação de 360°.', array['Rotação 360°', 'Ventosa firme', 'Garras ajustáveis', 'Liberação com uma mão']::text[], 15),
  ('pulseira-smartwatch', 'Pulseira Smartwatch', 'Silicone', 'acessorios', 59.9, null, 'images/products/watch-strap.svg', false, 'ativo', 'Pulseira de silicone confortável e resistente ao suor.', array['Silicone macio', 'Troca rápida', 'Resistente ao suor', 'Várias cores']::text[], 16)
on conflict (id) do update set
  name = excluded.name, variant = excluded.variant, category = excluded.category, price = excluded.price,
  old_price = excluded.old_price, image_url = excluded.image_url, featured = excluded.featured,
  description = excluded.description, features = excluded.features, position = excluded.position;

insert into public.site_settings (key, value) values
  ('hero_image', 'images/hero/iphones-hero.webp'),
  ('promo_image', 'images/promo/promo-iphones.webp')
on conflict (key) do update set value = excluded.value;
