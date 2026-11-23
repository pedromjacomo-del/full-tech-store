import { Clock, MapPin } from 'lucide-react';
import { site } from '../../config/site';

export function TopBar() {
  const [first, second] = site.topBar;
  return (
    <div className="bg-brand text-ink">
      <div className="container-x flex h-8 items-center justify-center gap-3 text-[11px] font-semibold sm:text-xs">
        <span className="flex items-center gap-2">
          <Clock size={14} strokeWidth={2.2} />
          {first}
        </span>
        <span className="hidden h-3.5 w-px bg-ink/40 sm:block" />
        <span className="hidden items-center gap-2 sm:flex">
          <MapPin size={14} strokeWidth={2.2} />
          {second}
        </span>
      </div>
    </div>
  );
}
