import { CreditCard, HeartHandshake, ShieldCheck, Smartphone, type LucideIcon } from 'lucide-react';

const benefits: { Icon: LucideIcon; title: string; text: string }[] = [
  { Icon: Smartphone, title: 'iPhones & Acessórios', text: 'Tudo para o seu celular' },
  { Icon: ShieldCheck, title: 'Capinhas & Películas', text: 'Proteção para o seu modelo' },
  { Icon: HeartHandshake, title: '+20 mil clientes', text: 'Histórias conectadas' },
  { Icon: CreditCard, title: 'Pix e Cartão', text: 'Visa e Mastercard' },
];

export function BenefitsBar() {
  return (
    <div className="relative border-t border-white/[0.07] bg-navy/80 backdrop-blur-sm">
      <ul className="container-x grid grid-cols-2 lg:grid-cols-4">
        {benefits.map(({ Icon, title, text }, i) => (
          <li
            key={title}
            className={[
              'flex items-center gap-2.5 py-4 sm:gap-3.5 sm:py-5 lg:justify-center lg:py-6',
              i % 2 === 1 ? 'pl-3 sm:pl-6' : 'pr-2',
              i > 0 ? 'lg:border-l lg:border-white/10 lg:pl-0' : '',
              i < 2 ? 'border-b border-white/10 lg:border-b-0' : '',
              i % 2 === 1 ? 'border-l border-white/10' : '',
            ].join(' ')}
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/[0.04] text-brand sm:h-11 sm:w-11">
              <Icon size={20} strokeWidth={1.6} className="sm:h-6 sm:w-6" />
            </span>
            <span>
              <span className="block text-[12.5px] font-semibold leading-tight text-white sm:text-sm">{title}</span>
              <span className="mt-0.5 block text-[11px] leading-snug text-white/60 sm:text-xs">{text}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
