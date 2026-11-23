import { useEffect, useState } from 'react';
import { Copy, Eye, EyeOff, KeyRound, RefreshCw, Send, Trash2, UserRound } from 'lucide-react';
import { api, type TeamMember } from '../lib/api';
import type { AdminCtx } from './Dashboard';
import { ConfirmDialog, Spinner } from './ui';

const newCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const block = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `FT-${block()}-${block()}-${block()}`;
};

export function TeamTab({ notify }: Pick<AdminCtx, 'notify'>) {
  const [team, setTeam] = useState<TeamMember[] | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [showCode, setShowCode] = useState(false);
  const [busy, setBusy] = useState(false);
  const [removing, setRemoving] = useState<TeamMember | null>(null);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    Promise.all([api.listTeam(), api.getAccessCode()])
      .then(([t, c]) => {
        setTeam(t);
        setCode(c);
      })
      .catch((e: Error) => notify(e.message, 'error'));
  }, [notify]);

  const adminUrl = `${window.location.origin}${window.location.pathname}#admin`;
  const invite = code
    ? `Acesso ao painel da Full Tech Store:\n1. Abra ${adminUrl}\n2. Toque em "Criar acesso"\n3. Use seu e-mail, crie uma senha e informe o código: ${code}`
    : '';

  async function copy(text: string, message: string) {
    try {
      await navigator.clipboard.writeText(text);
      notify(message);
    } catch {
      notify('Não foi possível copiar automaticamente. Selecione o texto e copie.', 'info');
    }
  }

  async function regenerate() {
    const next = newCode();
    setBusy(true);
    try {
      await api.setAccessCode(next);
      setCode(next);
      setShowCode(true);
      notify('Novo código criado. O código antigo não funciona mais para novos cadastros.');
      setRegenerating(false);
    } catch (e) {
      notify((e as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  }

  async function confirmRemove() {
    if (!removing) return;
    setBusy(true);
    try {
      await api.removeTeamMember(removing.userId);
      setTeam((t) => t?.filter((m) => m.userId !== removing.userId) ?? null);
      notify(`${removing.email} não tem mais acesso ao painel.`);
      setRemoving(null);
    } catch (e) {
      notify((e as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <h1 className="font-display text-2xl font-bold">Equipe e acesso</h1>
      <p className="mt-0.5 text-sm text-ink/55">Quem pode editar a loja e o código para novas pessoas criarem acesso.</p>

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* código */}
        <article className="rounded-2xl border border-line bg-white p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <KeyRound size={18} className="text-brand-deep" />
            <h2 className="font-semibold">Código de acesso</h2>
          </div>
          <p className="mt-1 text-xs text-ink/55">
            Quem tiver este código consegue criar um acesso ao painel em <b>“Área da loja” → Criar acesso</b>. Envie só para pessoas de confiança.
          </p>

          <div className="mt-4 flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-3">
            <code className="flex-1 truncate font-mono text-[15px] font-semibold tracking-wider">
              {code === null ? <Spinner size={16} /> : showCode ? code : '•••• •••• •••• ••••'}
            </code>
            <button type="button" onClick={() => setShowCode((s) => !s)} className="grid h-9 w-9 place-items-center rounded-lg text-ink/55 hover:bg-white" aria-label={showCode ? 'Esconder código' : 'Mostrar código'}>
              {showCode ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
            <button type="button" disabled={!code} onClick={() => code && copy(code, 'Código copiado.')} className="grid h-9 w-9 place-items-center rounded-lg text-ink/55 hover:bg-white" aria-label="Copiar código">
              <Copy size={17} />
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" disabled={!code} onClick={() => copy(invite, 'Convite copiado. Cole no WhatsApp da pessoa.')} className="btn-primary py-2.5 text-[13px]">
              <Send size={15} /> Copiar convite
            </button>
            <button
              type="button"
              onClick={() => setRegenerating(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-line px-3.5 py-2.5 text-[13px] font-semibold text-ink/70 transition hover:border-ink/30"
            >
              <RefreshCw size={15} /> Gerar novo código
            </button>
          </div>
          <p className="mt-3 text-xs text-ink/50">Dica: depois que todos criarem o acesso, gere um código novo. Quem já está na equipe continua entrando normalmente.</p>
        </article>

        {/* equipe */}
        <article className="rounded-2xl border border-line bg-white p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <UserRound size={18} className="text-brand-deep" />
            <h2 className="font-semibold">Quem tem acesso</h2>
            {team && <span className="rounded-full bg-surface px-2 text-xs font-bold text-ink/60">{team.length}</span>}
          </div>
          {!team ? (
            <div className="flex items-center gap-2 py-8 text-sm text-ink/55">
              <Spinner /> Carregando…
            </div>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {team.map((m) => (
                <li key={m.userId} className="flex items-center gap-3 py-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand/15 text-sm font-bold uppercase text-brand-deep">
                    {m.email.slice(0, 1)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {m.email} {m.isMe && <span className="ml-1 rounded-full bg-ink px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">você</span>}
                    </p>
                    <p className="text-xs text-ink/50">Desde {new Date(m.createdAt).toLocaleDateString('pt-BR')}</p>
                  </div>
                  {!m.isMe && (
                    <button
                      type="button"
                      onClick={() => setRemoving(m)}
                      className="grid h-8 w-8 place-items-center rounded-lg text-ink/40 transition hover:bg-red-50 hover:text-red-600"
                      aria-label={`Remover ${m.email}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </article>
      </div>

      {removing && (
        <ConfirmDialog
          danger
          title="Remover da equipe?"
          message={
            <>
              <b>{removing.email}</b> não vai mais conseguir editar a loja. Para voltar, a pessoa precisará do código de acesso.
            </>
          }
          confirmLabel="Remover"
          busy={busy}
          onCancel={() => setRemoving(null)}
          onConfirm={confirmRemove}
        />
      )}
      {regenerating && (
        <ConfirmDialog
          title="Gerar um novo código?"
          message="O código atual deixa de funcionar para novos cadastros. Quem já está na equipe continua com acesso."
          confirmLabel="Gerar novo"
          busy={busy}
          onCancel={() => setRegenerating(false)}
          onConfirm={regenerate}
        />
      )}
    </section>
  );
}
