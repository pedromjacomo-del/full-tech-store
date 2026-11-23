import { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { api } from '../lib/api';
import { DEMO_ACCESS_CODE } from '../lib/demoApi';
import { DemoNotice } from './DemoNotice';
import { Shell } from './Login';
import { Spinner } from './ui';

/** Conta existe, mas ainda não é da equipe: pede o código de acesso da loja. */
export function ClaimAccess({ email, onGranted, onSignOut }: { email: string; onGranted: () => void; onSignOut: () => void }) {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <Shell>
      <span className="grid h-11 w-11 place-items-center rounded-full bg-amber-50 text-amber-700">
        <KeyRound size={20} />
      </span>
      <h1 className="mt-4 font-display text-xl font-bold">Falta liberar seu acesso</h1>
      <p className="mt-1.5 text-sm text-ink/60">
        A conta <b className="text-ink">{email}</b> ainda não pode editar a loja. Informe o código de acesso para liberar.
      </p>
      {api.mode === 'demo' && (
        <DemoNotice className="mt-4" compact>
          Código de acesso da demonstração: <b className="font-mono">{DEMO_ACCESS_CODE}</b>
        </DemoNotice>
      )}
      <form
        className="mt-5 space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError(null);
          try {
            await api.claimAdmin(code);
            onGranted();
          } catch (err) {
            setError((err as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <input
          required
          autoFocus
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          placeholder="Código de acesso da loja"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="input font-mono uppercase tracking-wider placeholder:font-sans placeholder:normal-case placeholder:tracking-normal"
          aria-label="Código de acesso da loja"
        />
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p>}
        <button type="submit" disabled={busy} className="btn-primary w-full py-3 disabled:opacity-60">
          {busy && <Spinner size={16} />} Liberar acesso
        </button>
      </form>
      <button type="button" onClick={onSignOut} className="mt-3 w-full py-2 text-sm font-medium text-ink/55 transition hover:text-ink">
        Sair e usar outra conta
      </button>
    </Shell>
  );
}
