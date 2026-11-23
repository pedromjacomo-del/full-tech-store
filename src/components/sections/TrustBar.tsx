import { Clock, Instagram, MessageCircle, Store, type LucideIcon } from 'lucide-react';
import { contactLink, site } from '../../config/site';

const items: { Icon: LucideIcon; title: string; text: string; href?: string }[] = [
  { Icon: Store, title: 'Loja física', text: `Visite a gente no ${site.location}.` },
  { Icon: Clock, title: 'Aberto todos os dias', text: 'De segunda a domingo, das 10h às 22h.' },
  { Icon: Instagram, title: `@${site.instagramHandle}`, text: 'Novidades e lançamentos no Instagram.', href: site.instagramUrl },
  { Icon: MessageCircle, title: 'WhatsApp', text: `${site.whatsappDisplay} · pedidos, pagamento e entrega.`, href: contactLink('Olá, Full Tech Store! Vim pelo site.') },
];

export function TrustBar() {
  return (
    <section className="bg-surface pb-10 sm:pb-12">
      <div className="container-x">
        <ul className="grid grid-cols-2 rounded-2xl bg-navy px-1 text-white sm:px-4 lg:grid-cols-4 lg:py-6">
          {items.map(({ Icon, title, text, href }, i) => {
            const body = (
              <>
                <Icon size={34} strokeWidth={1.5} className="h-7 w-7 shrink-0 text-brand sm:h-[34px] sm:w-[34px]" />
                <div className="min-w-0">
                  <h3 className="break-words text-[13px] font-semibold sm:text-sm">{title}</h3>
                  <p className="mt-1 max-w-[220px] text-[11.5px] leading-relaxed text-white/65 sm:text-xs">{text}</p>
                </div>
              </>
            );
            return (
              <li
                key={title}
                className={[
                  'border-white/10 px-3 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-1',
                  i % 2 === 1 ? 'border-l' : '',
                  i >= 2 ? 'border-t lg:border-t-0' : '',
                  i === 2 ? 'lg:border-l' : '',
                ].join(' ')}
              >
                {href ? (
                  <a href={href} target="_blank" rel="noreferrer" className="flex flex-col items-start gap-2.5 transition hover:text-brand sm:flex-row sm:gap-4">
                    {body}
                  </a>
                ) : (
                  <div className="flex flex-col items-start gap-2.5 sm:flex-row sm:gap-4">{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
