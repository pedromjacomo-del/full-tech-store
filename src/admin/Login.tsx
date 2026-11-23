import { useState, type ReactNode } from 'react';
import { ArrowLeft, Eye, EyeOff, KeyRound, Lock, MailCheck, UserPlus } from 'lucide-react';
import { api, type AdminSession } from '../lib/api';
import { DEMO_ACCESS_CODE } from '../lib/demoApi';
import { cn } from '../lib/utils';
import { Logo } from '../components/ui/Logo';
import { DemoNotice } from './DemoNotice';
import { Spinner } from './ui';

type Mode = 'entrar' | 'criar';

export function Login({ onSuccess }: { onSuccess: (s: AdminSession) => void }) {
  const demo = api.mode === 'demo';
  const [mode, setMode] = useState<Mode>('entrar');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [code, setCode] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  const switchMode = (m: Mode) => {
    setMode(m);
    setError(null);
  };

  async function submit() {
    setError(null);
    if (mode === 'criar') {
      if (password.length < 8) return setError('A senha precisa ter pelo menos 8 caracteres.');
      if (password !== confirm) return setError('As senhas não conferem.');
      if (!code.trim()) return setError('Informe o código de acesso da loja.');
    }
    setBusy(true);
    try {
      if (mode === 'entrar') {
        onSuccess(await api.signIn(email.trim(), password));
      } else {
        const res = await api.signUp(email.trim(), password, code);
        if (res.needsConfirmation) setCheckEmail(true);
        else if (res.session) onSuccess(res.session);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (checkEmail) {
    return (
      <Shell>
        <span className="grid h-11 w-11 place-items-center rounded-full bg-brand/15 text-brand-deep">
          <MailCheck size={20} />
        </span>
        <h1 className="mt-4 font-display text-xl font-bold">Confirme seu e-mail</h1>
        <p className="mt-1.5 text-sm text-ink/60">
          Enviamos um link de confirmação para <b className="text-ink">{email}</b>. Depois de confirmar, volte aqui e clique em <b>Entrar</b>.
        </p>
        <button type="button" onClick={() => (setCheckEmail(false), switchMode('entrar'))} className="btn-primary mt-6 w-full py-3">
          Ir para Entrar
        </button>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="grid grid-cols-2 rounded-xl bg-surface p-1 text-sm font-semibold">
        {(['entrar', 'criar'] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => switchMode(m)}
            className={cn('flex items-center justify-center gap-1.5 rounded-lg py-2.5 transition', mode === m ? 'bg-white text-ink shadow-sm' : 'text-ink/50 hover:text-ink/75')}
          >
            {m === 'entrar' ? <Lock size={15} /> : <UserPlus size={15} />}
            {m === 'entrar' ? 'Entrar' : 'Criar acesso'}
          </button>
        ))}
      </div>

      <h1 className="mt-5 font-display text-xl font-bold">{mode === 'entrar' ? 'Painel da loja' : 'Criar seu acesso'}</h1>
      <p className="mt-1 text-sm text-ink/55">
        {mode === 'entrar'
          ? 'Entre para editar produtos, preços e fotos do site.'
          : 'Cadastre seu e-mail e senha. Você vai precisar do código de acesso da loja.'}
      </p>

      {demo && (
        <DemoNotice className="mt-4" compact>
          {mode === 'entrar' ? (
            <>Qualquer e-mail e senha entram. As alterações ficam só neste navegador.</>
          ) : (
            <>
              Código de acesso da demonstração: <b className="font-mono">{DEMO_ACCESS_CODE}</b>
            </>
          )}
        </DemoNotice>
      )}

      <form
        className="mt-5 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <input type="email" required autoComplete="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} className="input" aria-label="E-mail" />
        <div className="relative">
          <input
            type={show ? 'text' : 'password'}
            required
            autoComplete={mode === 'entrar' ? 'current-password' : 'new-password'}
            placeholder={mode === 'entrar' ? 'Senha' : 'Senha (mín. 8 caracteres)'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input pr-11"
            aria-label="Senha"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-1 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-ink/45 hover:text-ink"
            aria-label={show ? 'Esconder senha' : 'Mostrar senha'}
          >
            {show ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
        {mode === 'criar' && (
          <>
            <input
              type={show ? 'text' : 'password'}
              required
              autoComplete="new-password"
              placeholder="Repita a senha"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="input"
              aria-label="Repita a senha"
            />
            <label className="block">
              <span className="relative block">
                <KeyRound size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
                <input
                  required
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  placeholder="Código de acesso da loja"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="input pl-9 font-mono uppercase tracking-wider placeholder:font-sans placeholder:normal-case placeholder:tracking-normal"
                  aria-label="Código de acesso da loja"
                />
              </span>
              <span className="mt-1 block text-xs text-ink/50">Peça ao responsável pelo site. Ele aparece na aba “Equipe” do painel.</span>
            </label>
          </>
        )}

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p>}

        <button type="submit" disabled={busy} className="btn-primary w-full py-3 disabled:opacity-60">
          {busy && <Spinner size={16} />} {mode === 'entrar' ? 'Entrar' : 'Criar acesso e entrar'}
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-ink/50">
        {mode === 'entrar' ? (
          <>
            Primeira vez?{' '}
            <button type="button" onClick={() => switchMode('criar')} className="font-semibold text-brand-deep hover:underline">
              Criar acesso
            </button>
          </>
        ) : (
          <>
            Já tem cadastro?{' '}
            <button type="button" onClick={() => switchMode('entrar')} className="font-semibold text-brand-deep hover:underline">
              Entrar
            </button>
          </>
        )}
      </p>
    </Shell>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  return (
    <main className="hero-bg flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <Logo onClick={() => (window.location.hash = 'home')} />
        </div>
        <div className="animate-pop-in rounded-2xl bg-white p-6 shadow-2xl sm:p-7">{children}</div>
        <a href="#home" className="mt-5 flex items-center justify-center gap-1.5 text-sm text-white/70 transition hover:text-brand">
          <ArrowLeft size={15} /> Voltar para o site
        </a>
      </div>
    </main>
  );
}
