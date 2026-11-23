/**
 * Categorias iniciais — usadas no modo demonstração e para gerar supabase/seed.sql.
 * Com o Supabase configurado, as categorias vêm do banco e são editadas no painel (/#admin).
 */
export type CategorySlug = string;

export interface Category {
  slug: CategorySlug;
  name: string;
  image: string;
  position?: number;
}

/** Ordem aqui = ordem dos cards na página inicial. */
export const categories: Category[] = [
  { slug: 'iphones', name: 'iPhones', image: 'images/categories/iphones.webp' },
  { slug: 'capinhas', name: 'Capinhas', image: 'images/categories/capinhas.webp' },
  { slug: 'peliculas', name: 'Películas', image: 'images/categories/peliculas.webp' },
  { slug: 'fones', name: 'Fones', image: 'images/categories/fones.webp' },
  { slug: 'carregadores-cabos', name: 'Carregadores & Cabos', image: 'images/categories/carregadores-cabos.webp' },
  { slug: 'acessorios', name: 'Acessórios', image: 'images/categories/acessorios.webp' },
];
