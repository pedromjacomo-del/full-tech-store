import { ArrowRight, Play } from 'lucide-react';
import { site } from '../../config/site';
import { useStore } from '../../context/StoreContext';
import { useCatalog } from '../../context/CatalogContext';
import { imageSrc } from '../../lib/utils';
import { Stars } from '../ui/Stars';
import { ScriptNote } from '../ui/ScriptNote';
import { BenefitsBar } from './BenefitsBar';

export function Hero() {
  const { goShop, open } = useStore();
  const { heroImage } = useCatalog();
  const h = site.hero;

  const videoBtnInner = (
    <>
      <span className="grid h-10 w-10 place-items-center rounded-full border-2 sm:h-12 sm:w-12 border-white/90 transition group-hover:border-brand group-hover:bg-brand">
        <Play size={18} fill="currentColor" className="ml-0.5 text-white transition group-hover:text-ink" />
      </span>
      {site.videoUrl ? 'Ver vídeo' : 'Ver Reels'}
    </>
  );
  const videoBtnCls = 'group inline-flex items-center gap-2.5 text-[14px] sm:gap-3 sm:text-[15px] font-medium text-white transition hover:text-brand';

  return (
    <section id="top" className="hero-bg relative overflow-hidden text-white">
      <span className="hero-beam right-[2%] top-[18%] w-[46%] -rotate-[38deg] opacity-80" />
      <span className="hero-beam right-[-6%] top-[30%] w-[38%] -rotate-[38deg] opacity-40" />
      <span className="hero-beam bottom-[24%] left-[-8%] w-[30%] -rotate-[32deg] opacity-30" />

      <div className="container-x relative grid items-center gap-2 pt-8 pb-4 sm:gap-6 sm:pt-10 sm:pb-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-4 lg:pt-6 lg:pb-2">
        <div className="relative z-10 max-w-[600px] animate-pop-in py-4 lg:py-16">
          <p className="text-[13px] font-semibold uppercase tracking-[0.06em] text-brand sm:text-[15px]">{h.eyebrow}</p>
          <h1 className="mt-3 font-display text-[34px] font-extrabold leading-[1.08] tracking-[-0.02em] min-[400px]:text-[38px] sm:mt-4 sm:text-[50px] lg:text-[44px] xl:text-[52px]">
            <span className="block lg:whitespace-nowrap">{h.titleLine1}</span>
            <span className="block text-brand lg:whitespace-nowrap">{h.titleLine2}</span>
          </h1>
          <p className="mt-4 max-w-[450px] text-[15px] leading-relaxed text-white/85 sm:mt-5 sm:text-[17px]">{h.description}</p>

          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-4 sm:mt-8">
            <button type="button" onClick={() => goShop()} className="btn-primary px-5 py-3 text-[14px] sm:px-7 sm:py-3.5 sm:text-[15px]">
              Comprar agora <ArrowRight size={18} strokeWidth={2.4} />
            </button>
            {site.videoUrl ? (
              <button type="button" onClick={() => open('video')} className={videoBtnCls}>
                {videoBtnInner}
              </button>
            ) : (
              <a href={`${site.instagramUrl}reels/`} target="_blank" rel="noreferrer" className={videoBtnCls}>
                {videoBtnInner}
              </a>
            )}
          </div>

          <div className="mt-7 flex items-center gap-3 sm:mt-9 sm:gap-4">
            <div className="flex -space-x-3">
              {h.customers.map((src, i) => (
                <img key={i} src={imageSrc(src)} alt="" className="h-10 w-10 rounded-full border-2 border-ink object-cover sm:h-11 sm:w-11" />
              ))}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{h.trust.title}</p>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                <Stars rating={5} size={14} />
                <span className="whitespace-nowrap text-[12px] text-white/70 sm:text-[13px]">{h.trust.subtitle}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative -mx-4 -mt-2 self-end sm:-mx-6 sm:mt-0 lg:mx-0 lg:-mr-[max(2rem,calc((100vw-1200px)/2+2rem))] lg:-mb-2">
          <img
            src={heroImage}
            alt="iPhones nas cores preto, magenta, azul e prata com iluminação verde"
            className="hero-photo relative ml-auto w-full max-w-[860px]"
          />
          {h.script.length > 0 && (
            <ScriptNote
              lines={h.script}
              className="absolute right-2 top-2 rotate-[-12deg] text-[22px] sm:right-4 sm:top-6 sm:text-[30px] lg:right-6"
            />
          )}
        </div>
      </div>

      <BenefitsBar />
    </section>
  );
}
