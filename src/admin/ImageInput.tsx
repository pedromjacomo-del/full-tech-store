import { useRef, useState } from 'react';
import { Camera, ImageOff, RefreshCw } from 'lucide-react';
import { api } from '../lib/api';
import { compressImage } from '../lib/image';
import { cn, imageSrc } from '../lib/utils';
import { Spinner } from './ui';

/**
 * Escolher/trocar foto. No celular abre a galeria ou a câmera.
 * A foto é reduzida e comprimida antes de enviar.
 */
export function ImageInput({
  value,
  onChange,
  folder,
  maxSize = 1200,
  shape = 'square',
  dark,
  allowRemove,
  onError,
}: {
  value: string;
  onChange: (url: string) => void;
  folder: string;
  maxSize?: number;
  shape?: 'square' | 'wide';
  dark?: boolean;
  allowRemove?: boolean;
  onError: (message: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      const limit = api.mode === 'demo' ? Math.min(maxSize, 700) : maxSize;
      const blob = await compressImage(file, limit);
      const url = await api.uploadImage(blob, folder);
      onChange(url);
    } catch (e) {
      onError((e as Error).message || 'Não foi possível enviar a foto.');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div>
      <div
        className={cn(
          'relative grid place-items-center overflow-hidden rounded-xl border border-line',
          shape === 'square' ? 'mx-auto aspect-square w-full max-w-[260px]' : 'aspect-[16/9] w-full',
          dark ? 'bg-ink' : 'bg-white',
        )}
      >
        {value ? (
          <img src={imageSrc(value)} alt="" className={cn('h-full w-full', shape === 'square' ? 'object-contain p-3' : 'object-cover')} />
        ) : (
          <span className="flex flex-col items-center gap-2 text-sm text-ink/40">
            <ImageOff size={28} /> Sem foto
          </span>
        )}
        {busy && (
          <span className="absolute inset-0 grid place-items-center bg-white/75 text-sm font-semibold text-ink/70">
            <span className="flex items-center gap-2">
              <Spinner /> Enviando foto…
            </span>
          </span>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => handleFile(e.target.files?.[0])}
        aria-label="Escolher foto"
      />
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ink/85 disabled:opacity-60"
        >
          {value ? <RefreshCw size={16} /> : <Camera size={16} />}
          {value ? 'Trocar foto' : 'Escolher foto'}
        </button>
        {allowRemove && value && (
          <button
            type="button"
            onClick={() => onChange('')}
            disabled={busy}
            className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink/70 transition hover:border-red-300 hover:text-red-600"
          >
            Remover
          </button>
        )}
      </div>
    </div>
  );
}
