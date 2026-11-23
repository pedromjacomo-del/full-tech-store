/**
 * Endereço final de uma imagem. No HTML único as imagens que vêm com o site ficam embutidas
 * (window.__IMG_MAP__); no site normal o caminho é usado como está.
 */
export const imageSrc = (src: string | undefined | null) => {
  if (!src) return '';
  const map = (globalThis as { __IMG_MAP__?: Record<string, string> }).__IMG_MAP__;
  return map?.[src] ?? src;
};

export const cn = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(' ');

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
export const formatPrice = (value: number | null) => (value === null ? 'Sob consulta' : brl.format(value));

export const storage = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key: string, value: unknown) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* armazenamento indisponível — ignora */
    }
  },
};
