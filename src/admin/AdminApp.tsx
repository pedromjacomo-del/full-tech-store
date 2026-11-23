import { useEffect, useState } from 'react';
import { api, type AdminSession } from '../lib/api';
import { ClaimAccess } from './ClaimAccess';
import { Dashboard } from './Dashboard';
import { Login } from './Login';
import { FullScreenSpinner } from './ui';

/** Painel da loja — acessado em /#admin ("Área da loja" no rodapé). */
export default function AdminApp() {
  const [session, setSession] = useState<AdminSession | null | undefined>(undefined);

  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'Painel da loja · Full Tech Store';
    document.documentElement.style.overflow = '';
    window.scrollTo(0, 0);
    api
      .getSession()
      .then(setSession)
      .catch(() => setSession(null));
    return () => {
      document.title = prevTitle;
    };
  }, []);

  const signOut = async () => {
    await api.signOut();
    setSession(null);
  };

  if (session === undefined) return <FullScreenSpinner label="Verificando acesso…" />;
  if (!session) return <Login onSuccess={setSession} />;
  if (!session.isAdmin)
    return <ClaimAccess email={session.email} onGranted={() => setSession({ ...session, isAdmin: true })} onSignOut={signOut} />;
  return <Dashboard email={session.email} onSignOut={signOut} />;
}
