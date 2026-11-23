import { useState } from 'react';
import { LogOut, User } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { cn } from '../../lib/utils';
import { CloseButton, Modal } from '../ui/Overlay';

export function AccountModal() {
  const { close, user, signIn, signOut } = useStore();
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [email, setEmail] = useState('');

  return (
    <Modal onClose={close} label="Minha conta" className="max-w-md">
      <CloseButton onClick={close} className="absolute right-3 top-3" />
      <div className="p-7 sm:p-8">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-brand/15 text-brand-deep">
          <User size={22} />
        </span>
        {user ? (
          <>
            <h2 className="mt-4 font-display text-xl font-bold">Minha conta</h2>
            <p className="mt-1 text-sm text-ink/60">Conectado como <b className="text-ink">{user}</b></p>
            <button
              type="button"
              onClick={() => {
                signOut();
                close();
              }}
              className="mt-6 inline-flex items-center gap-2 rounded-lg border border-line px-4 py-2.5 text-sm font-semibold transition hover:border-brand hover:text-brand-deep"
            >
              <LogOut size={16} /> Sair
            </button>
          </>
        ) : (
          <>
            <h2 className="mt-4 font-display text-xl font-bold">{mode === 'in' ? 'Bem-vindo(a) de volta' : 'Crie sua conta'}</h2>
            <p className="mt-1 text-sm text-ink/60">Acompanhe seus pedidos e compre mais rápido.</p>
            <div className="mt-5 grid grid-cols-2 rounded-lg bg-surface p-1 text-sm font-semibold">
              {(['in', 'up'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={cn('rounded-md py-2 transition', mode === m ? 'bg-white text-ink shadow-sm' : 'text-ink/50')}
                >
                  {m === 'in' ? 'Entrar' : 'Cadastrar'}
                </button>
              ))}
            </div>
            <form
              className="mt-5 space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                signIn(email);
                close();
              }}
            >
              {mode === 'up' && <input required className="input" placeholder="Nome completo" autoComplete="name" />}
              <input required type="email" className="input" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
              <input required type="password" minLength={6} className="input" placeholder="Senha" autoComplete={mode === 'in' ? 'current-password' : 'new-password'} />
              <button type="submit" className="btn-primary w-full py-3">
                {mode === 'in' ? 'Entrar' : 'Criar conta'}
              </button>
            </form>
          </>
        )}
      </div>
    </Modal>
  );
}
