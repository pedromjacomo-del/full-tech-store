import { ArrowRight } from 'lucide-react';
import { site } from '../../config/site';
import { useStore } from '../../context/StoreContext';
import { useCatalog } from '../../context/CatalogContext';
import { ScriptNote } from '../ui/ScriptNote';

export function PromoBanner() {
  const { goShop } = useStore();
  const { promoImage } = useCatalog();
  const p = site.promo;
  return (
    <section id="deals" className="scroll-mt-24 bg-surface py-6">
      <div className="container-x">
        <div className="relative overflow-hidden rounded-2xl bg-ink text-white shadow-[0_30px_60px_-30px_rgb(5_5_5/0.6)] md:min-h-[400px] lg:min-h-[430px]">
          {/* glow suave atrás do texto, combinando com a luz verde da foto */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_0%_100%,rgb(142_209_63/0.14),transparent_70%)]" />

          <div className="relative z-10 px-6 pt-9 pb-2 sm:px-10 md:flex md:min-h-[400px] md:max-w-[50%] md:flex-col md:justify-center md:py-12 md:pl-12 lg:min-h-[430px] lg:pl-14">
            <p className="text-[13px] font-semibold uppercase tracking-[0.06em] text-brand sm:text-[15px]">{p.eyebrow}</p>
            <h2 className="mt-2 font-display text-[40px] font-extrabold leading-[1.05] tracking-[-0.02em] sm:text-[50px] lg:text-[58px]">
              {p.titleStart} <span className="block text-brand">{p.titleHighlight}</span>
            </h2>
            <p className="mt-2 text-lg font-medium text-white/90 sm:text-[22px]">{p.subtitle}</p>
            <button type="button" onClick={() => goShop({ category: 'capinhas' })} className="btn-primary mt-7 self-start px-6 py-3">
              {p.cta} <ArrowRight size={17} strokeWidth={2.4} />
            </button>
          </div>

          <img
            src={promoImage}
            alt="iPhones com capinhas transparentes MagSafe e fones sem fio em um pedestal com luz verde"
            loading="lazy"
            className="promo-photo relative -mt-6 block w-full md:absolute md:inset-y-0 md:right-0 md:mt-0 md:h-full md:w-auto md:max-w-[60%] md:object-cover md:object-left"
          />
          {p.script.length > 0 && (
            <ScriptNote
              lines={p.script}
              className="absolute right-4 top-3 hidden rotate-[-12deg] text-[20px] sm:block sm:right-8 sm:top-6 sm:text-[26px]"
            />
          )}
        </div>
      </div>
    </section>
  );
}
