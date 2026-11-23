/**
 * FULL TECH STORE — CONFIGURAÇÕES DA LOJA
 * Marca, textos e contato ficam aqui. Cores ficam em src/index.css (@theme).
 * Informações tiradas do perfil @fulltechstorebsb.
 */
export const site = {
  name: 'Full Tech Store',
  tagline: 'iPhones & Acessórios Celular',
  instagramHandle: 'fulltechstorebsb',
  instagramUrl: 'https://www.instagram.com/fulltechstorebsb/',
  /** Link do Direct do Instagram (usado quando não há WhatsApp configurado). */
  instagramDirect: 'https://ig.me/m/fulltechstorebsb',
  /**
   * WhatsApp com DDI + DDD, só números.
   * "Gerar pedido" e "Consultar" abrem este WhatsApp com a mensagem pronta.
   */
  whatsapp: '556196089741',
  whatsappDisplay: '+55 61 9608-9741',

  location: 'Águas Claras Shopping – DF',
  hours: '10h às 22h · Seg a Dom',

  topBar: ['Aberto todos os dias · 10h às 22h', 'Águas Claras Shopping – DF'],

  hero: {
    eyebrow: 'iPhones & Acessórios Celular',
    titleLine1: 'Seu próximo upgrade.',
    titleLine2: 'Começa aqui.',
    description:
      'iPhones, capinhas, películas, fones e carregadores — tudo para deixar seu celular protegido, carregado e com estilo.',
    /** Texto manuscrito sobre a imagem (deixe [] para não mostrar). */
    script: [] as string[],
    image: 'images/hero/iphones-hero.webp',
    trust: { title: '+20 mil histórias conectadas', subtitle: 'Águas Claras Shopping – DF' },
    customers: ['images/customers/customer-1.svg', 'images/customers/customer-2.svg', 'images/customers/customer-3.svg'],
  },

  promo: {
    eyebrow: 'Proteção completa',
    titleStart: 'Proteja seu',
    titleHighlight: 'iPhone',
    subtitle: 'Capinhas e películas para o seu modelo',
    cta: 'Ver capinhas',
    /** Texto manuscrito sobre a imagem (deixe [] para não mostrar). */
    script: [] as string[],
    image: 'images/promo/promo-iphones.webp',
  },

  /** Cole um link de vídeo embed (ex.: https://www.youtube.com/embed/ID) para tocar no site.
   *  Vazio = o botão leva para os Reels do Instagram. */
  videoUrl: '',

  payments: ['Pix', 'Visa', 'Mastercard'],
};

export const navItems = [
  { id: 'home', label: 'Início' },
  { id: 'shop', label: 'Loja' },
  { id: 'categories', label: 'Categorias' },
  { id: 'deals', label: 'Ofertas' },
  { id: 'about', label: 'Sobre' },
  { id: 'contact', label: 'Contato' },
] as const;

export type NavId = (typeof navItems)[number]['id'];

/** Link de atendimento: WhatsApp (com mensagem) se configurado, senão Direct do Instagram. */
export const contactLink = (message: string) =>
  site.whatsapp ? `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}` : site.instagramDirect;
