import type { ReactNode } from 'react';
import { FlaskConical } from 'lucide-react';
import { cn } from '../lib/utils';

export function DemoNotice({ className, compact, children }: { className?: string; compact?: boolean; children?: ReactNode }) {
  return (
    <div className={cn('flex items-start gap-2.5 rounded-xl bg-amber-50 px-3.5 py-3 text-amber-900 ring-1 ring-amber-200', className)}>
      <FlaskConical size={17} className="mt-px shrink-0" />
      <p className="text-xs leading-relaxed">
        <b>Modo demonstração.</b>{' '}
        {children ??
          (compact
            ? 'As alterações ficam só neste navegador.'
            : 'As alterações ficam salvas só neste navegador. Configure o Supabase (veja o guia) para valer no site de verdade.')}
      </p>
    </div>
  );
}
