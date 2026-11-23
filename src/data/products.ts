import type { CategorySlug } from './categories';

/**
 * CATÁLOGO INICIAL — usado no modo demonstração e para gerar supabase/seed.sql.
 * Com o Supabase configurado, os produtos vêm do banco e são editados no painel (/#admin).
 *
 * ⚠️ Os preços de acessórios abaixo são EXEMPLOS — substitua pelos preços reais da loja.
 * price: null  → mostra "Sob consulta" e o botão leva ao atendimento (usado nos iPhones).
 * oldPrice     → preço "de", aparece riscado e coloca o produto em "Ofertas".
 * featured     → aparece em "Mais vendidos" na página inicial (os 6 primeiros).
 */
export type ProductStatus = 'ativo' | 'esgotado' | 'oculto';

export interface Product {
  id: string;
  name: string;
  /** Segunda linha embaixo do nome, ex.: "(MagSafe)". */
  variant: string;
  category: CategorySlug;
  price: number | null;
  oldPrice?: number | null;
  image: string;
  featured?: boolean;
  /** ativo = à venda · esgotado = aparece com selo e não vai ao carrinho · oculto = não aparece no site */
  status?: ProductStatus;
  position?: number;
  description: string;
  features: string[];
}

const img = (file: string) => `images/products/${file}.svg`;

export const products: Product[] = [
  {
    id: 'iphone-17-pro-max',
    name: 'iPhone 17 Pro Max',
    variant: 'Consulte cores',
    category: 'iphones',
    price: null,
    image: img('iphone-17-pro-max'),
    featured: true,
    description: 'Consulte cores, capacidades e condições de pagamento com a nossa equipe.',
    features: ['Atendimento na loja ou pelo WhatsApp', 'Pagamento em Pix ou cartão', 'Capinhas e películas para o seu modelo'],
  },
  {
    id: 'capinha-magsafe-transparente',
    name: 'Capinha MagSafe',
    variant: 'Transparente',
    category: 'capinhas',
    price: 129.9,
    oldPrice: 159.9,
    image: img('case-magsafe'),
    featured: true,
    description: 'Capinha transparente com ímãs MagSafe, compatível com carregadores, carteiras e suportes magnéticos.',
    features: ['Ímãs MagSafe', 'Bordas elevadas para câmera e tela', 'Fundo transparente', 'Disponível para vários modelos de iPhone'],
  },
  {
    id: 'pelicula-vidro-3d',
    name: 'Película de Vidro',
    variant: 'Aplicada na loja',
    category: 'peliculas',
    price: 59.9,
    oldPrice: 79.9,
    image: img('glass-tempered'),
    featured: true,
    description: 'Película de vidro temperado que cobre a tela inteira, aplicada pela nossa equipe na hora.',
    features: ['Vidro temperado', 'Cobertura total da tela', 'Aplicação na loja', 'Compatível com capinha'],
  },
  {
    id: 'fone-bluetooth',
    name: 'Fone Bluetooth',
    variant: 'Com estojo de carga',
    category: 'fones',
    price: 199.9,
    oldPrice: 249.9,
    image: img('earbuds'),
    featured: true,
    description: 'Fone sem fio com estojo de carregamento, controles por toque e conexão Bluetooth.',
    features: ['Bluetooth', 'Estojo de carregamento', 'Controle por toque', 'Microfone para chamadas'],
  },
  {
    id: 'fonte-20w-usbc',
    name: 'Fonte 20W',
    variant: 'USB-C',
    category: 'carregadores-cabos',
    price: 99.9,
    oldPrice: 129.9,
    image: img('charger-20w'),
    featured: true,
    description: 'Carregador de parede USB-C de 20W para carregamento rápido do iPhone.',
    features: ['20W USB-C', 'Carregamento rápido', 'Compacta', 'Proteção contra superaquecimento'],
  },
  {
    id: 'cabo-usbc',
    name: 'Cabo USB-C',
    variant: 'Trançado · 1 m',
    category: 'carregadores-cabos',
    price: 49.9,
    image: img('cable-usbc'),
    featured: true,
    description: 'Cabo trançado resistente para carregamento e transferência de dados.',
    features: ['Revestimento trançado', 'Carregamento rápido', 'Transferência de dados', '1 metro'],
  },
  {
    id: 'iphone-17-pro',
    name: 'iPhone 17 Pro',
    variant: 'Consulte cores',
    category: 'iphones',
    price: null,
    image: img('iphone-17-pro'),
    description: 'Consulte cores, capacidades e condições de pagamento com a nossa equipe.',
    features: ['Atendimento na loja ou pelo WhatsApp', 'Pagamento em Pix ou cartão', 'Capinhas e películas para o seu modelo'],
  },
  {
    id: 'iphone-17',
    name: 'iPhone 17',
    variant: 'Consulte cores',
    category: 'iphones',
    price: null,
    image: img('iphone-17'),
    description: 'Consulte cores, capacidades e condições de pagamento com a nossa equipe.',
    features: ['Atendimento na loja ou pelo WhatsApp', 'Pagamento em Pix ou cartão', 'Capinhas e películas para o seu modelo'],
  },
  {
    id: 'iphone-16',
    name: 'iPhone 16',
    variant: 'Consulte cores',
    category: 'iphones',
    price: null,
    image: img('iphone-16'),
    description: 'Consulte cores, capacidades e condições de pagamento com a nossa equipe.',
    features: ['Atendimento na loja ou pelo WhatsApp', 'Pagamento em Pix ou cartão', 'Capinhas e películas para o seu modelo'],
  },
  {
    id: 'capinha-silicone',
    name: 'Capinha de Silicone',
    variant: 'MagSafe · Verde',
    category: 'capinhas',
    price: 99.9,
    image: img('case-silicone-green'),
    description: 'Capinha de silicone com toque macio, forro interno e suporte a MagSafe.',
    features: ['Silicone com toque macio', 'Forro interno', 'MagSafe', 'Várias cores'],
  },
  {
    id: 'capinha-antiimpacto',
    name: 'Capinha Anti-impacto',
    variant: 'Preta',
    category: 'capinhas',
    price: 89.9,
    oldPrice: 109.9,
    image: img('case-rugged'),
    description: 'Capinha com cantos reforçados para absorver quedas, com acabamento fosco.',
    features: ['Cantos reforçados', 'Acabamento fosco', 'Botões precisos', 'Compatível com carregamento sem fio'],
  },
  {
    id: 'pelicula-privacidade',
    name: 'Película Privacidade',
    variant: 'Anti-espião',
    category: 'peliculas',
    price: 79.9,
    image: img('glass-privacy'),
    description: 'Deixa a tela visível só para você — quem olha de lado vê a tela escura.',
    features: ['Filtro de privacidade', 'Vidro temperado', 'Toque sensível', 'Aplicação na loja'],
  },
  {
    id: 'headphone-bluetooth',
    name: 'Headphone Bluetooth',
    variant: 'Over-ear',
    category: 'fones',
    price: 349.9,
    oldPrice: 399.9,
    image: img('headphones'),
    description: 'Headphone sem fio com almofadas confortáveis para música, chamadas e jogos.',
    features: ['Bluetooth', 'Almofadas confortáveis', 'Bateria de longa duração', 'Microfone integrado'],
  },
  {
    id: 'carregador-sem-fio',
    name: 'Carregador sem Fio',
    variant: '15W',
    category: 'carregadores-cabos',
    price: 149.9,
    image: img('wireless-pad'),
    description: 'Base de carregamento por indução: é só apoiar o celular.',
    features: ['Até 15W', 'Funciona com capinha fina', 'Base antiderrapante', 'Indicador de carga'],
  },
  {
    id: 'power-bank-10000',
    name: 'Power Bank',
    variant: '10.000 mAh',
    category: 'acessorios',
    price: 199.9,
    oldPrice: 239.9,
    image: img('power-bank'),
    description: 'Bateria portátil para carregar o celular em qualquer lugar.',
    features: ['10.000 mAh', 'Saída USB-C', 'Indicador de bateria', 'Tamanho de bolso'],
  },
  {
    id: 'suporte-veicular',
    name: 'Suporte Veicular',
    variant: 'Rotação 360°',
    category: 'acessorios',
    price: 89.9,
    image: img('car-mount'),
    description: 'Suporte para painel ou para-brisa com garras ajustáveis e rotação de 360°.',
    features: ['Rotação 360°', 'Ventosa firme', 'Garras ajustáveis', 'Liberação com uma mão'],
  },
  {
    id: 'pulseira-smartwatch',
    name: 'Pulseira Smartwatch',
    variant: 'Silicone',
    category: 'acessorios',
    price: 59.9,
    image: img('watch-strap'),
    description: 'Pulseira de silicone confortável e resistente ao suor.',
    features: ['Silicone macio', 'Troca rápida', 'Resistente ao suor', 'Várias cores'],
  },
];

export const discountOf = (p: Product) =>
  p.oldPrice && p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
