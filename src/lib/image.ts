/**
 * Reduz e comprime fotos antes do envio (fotos de celular têm 3–8 MB).
 * Resultado: WebP (ou JPEG, se o navegador não gerar WebP) com o lado maior limitado a `maxSize`.
 */
export async function compressImage(file: File, maxSize = 1200, quality = 0.85): Promise<Blob> {
  if (!file.type.startsWith('image/')) throw new Error('Escolha um arquivo de imagem (JPG, PNG ou WebP).');

  const source = await loadImage(file);
  const scale = Math.min(1, maxSize / Math.max(source.width, source.height));
  const w = Math.max(1, Math.round(source.width * scale));
  const h = Math.max(1, Math.round(source.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(source.image, 0, 0, w, h);
  if ('close' in source.image) (source.image as ImageBitmap).close();

  const toBlob = (type: string) => new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
  let blob = await toBlob('image/webp');
  if (!blob || blob.type !== 'image/webp') blob = await toBlob('image/jpeg');
  if (!blob) return file;
  // Se a "compressão" ficou maior que o original (imagem já otimizada), mantém o original.
  return blob.size < file.size || file.size > 1.5 * 1024 * 1024 ? blob : file;
}

async function loadImage(file: File): Promise<{ image: CanvasImageSource; width: number; height: number }> {
  if ('createImageBitmap' in window) {
    try {
      const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' } as ImageBitmapOptions);
      return { image: bmp, width: bmp.width, height: bmp.height };
    } catch {
      /* cai para <img> */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Não foi possível abrir essa imagem.'));
      el.src = url;
    });
    return { image: img, width: img.naturalWidth, height: img.naturalHeight };
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
