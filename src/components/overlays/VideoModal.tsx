import { useEffect, useState } from 'react';
import { site } from '../../config/site';
import { useCatalog } from '../../context/CatalogContext';
import { useStore } from '../../context/StoreContext';
import { cn, formatPrice } from '../../lib/utils';
import { CloseButton, Modal } from '../ui/Overlay';

/** Plays site.videoUrl when set; otherwise shows an animated product reel. */
export function VideoModal() {
  const { close, openProduct } = useStore();
  const { featured: featuredProducts } = useCatalog();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (site.videoUrl) return;
    const t = setInterval(() => setI((n) => (n + 1) % Math.max(1, featuredProducts.length)), 2600);
    return () => clearInterval(t);
  }, [featuredProducts.length]);

  return (
    <Modal onClose={close} label="Vídeo" className="max-w-4xl overflow-hidden bg-ink text-white">
      <CloseButton onClick={close} className="absolute right-3 top-3 z-10 text-white hover:bg-white/10" />
      <div className="relative aspect-video w-full">
        {site.videoUrl ? (
          <iframe
            src={`${site.videoUrl}?autoplay=1`}
            title={`${site.name} video`}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <div className="hero-bg absolute inset-0">
            {featuredProducts.map((p, n) => (
              <div
                key={p.id}
                className={cn(
                  'absolute inset-0 grid items-center gap-4 px-8 transition-all duration-700 sm:grid-cols-2 sm:px-14',
                  n === i ? 'opacity-100' : 'pointer-events-none translate-x-6 opacity-0',
                )}
              >
                <div className="order-2 sm:order-1">
                  <p className="text-xs font-semibold uppercase tracking-widest text-brand">{site.name}</p>
                  <h3 className="mt-2 font-display text-2xl font-extrabold sm:text-4xl">{p.name}</h3>
                  <p className="mt-1 text-white/70">{p.variant}</p>
                  <button
                    type="button"
                    onClick={() => openProduct(p.id)}
                    className="btn-primary mt-5 hidden sm:inline-flex"
                  >
                    Ver · {formatPrice(p.price)}
                  </button>
                </div>
                <div className="order-1 mx-auto grid aspect-square w-40 place-items-center rounded-full bg-white/95 p-4 shadow-[0_0_80px_rgb(142_209_63/0.45)] sm:order-2 sm:w-64">
                  <img src={p.image} alt="" className="h-full w-full object-contain" />
                </div>
              </div>
            ))}
            <div className="absolute inset-x-8 bottom-5 flex gap-1.5 sm:inset-x-14">
              {featuredProducts.map((p, n) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setI(n)}
                  className="h-1 flex-1 overflow-hidden rounded-full bg-white/20"
                  aria-label={`Mostrar ${p.name}`}
                >
                  <span className={cn('block h-full bg-brand transition-all', n === i ? 'w-full duration-[2600ms] ease-linear' : n < i ? 'w-full duration-0' : 'w-0 duration-0')} />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
