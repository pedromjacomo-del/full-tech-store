import { site } from '../../config/site';
import { cn } from '../../lib/utils';

/**
 * Logotipo Full Tech Store: "FULL TECH" em branco itálico + "STORE" em verde com linhas.
 * Para usar o arquivo oficial, troque por <img src="images/logo.png" alt="Full Tech Store" />.
 */
export function Logo({ className, onClick }: { className?: string; onClick?: () => void }) {
  return (
    <a
      href="#home"
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn('inline-flex flex-col items-stretch leading-none select-none', className)}
      aria-label={`${site.name} — início`}
    >
      <span className="bg-gradient-to-b from-white via-white to-[#c9ccd0] bg-clip-text pr-1 font-display text-[23px] font-black italic tracking-[-0.03em] text-transparent">
        FULL TECH
      </span>
      <span className="mt-[3px] flex items-center gap-1.5">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent to-brand" />
        <span className="relative bg-gradient-to-b from-brand-2 to-brand bg-clip-text font-display text-[12px] font-black italic tracking-[0.06em] text-transparent">
          STORE
          <span className="absolute -bottom-1 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-brand/70 blur-[3px]" />
        </span>
        <span className="h-px flex-1 bg-gradient-to-l from-transparent to-brand" />
      </span>
    </a>
  );
}
