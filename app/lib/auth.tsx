// 로그인 — 이메일 6자리 코드 (faith-tracker 와 같은 방식). 로그인은 선택: 나눔 글쓰기·노트 백업에만 필요.
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { isConfigured, supabase } from './supabase';
import { syncNotesWithServer } from './store';

type AuthValue = { session: Session | null; userId: string | null; loading: boolean; signOut: () => Promise<void> };
const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isConfigured);

  useEffect(() => {
    if (!isConfigured) return;
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => { if (mounted) { setSession(data.session); setLoading(false); } });
    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      if (!mounted) return;
      setSession(next); setLoading(false);
      if (event === 'SIGNED_IN' && next) syncNotesWithServer(next.user.id).catch(() => {});
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);

  const value = useMemo<AuthValue>(() => ({
    session, userId: session?.user.id ?? null, loading,
    signOut: async () => { await supabase.auth.signOut(); },
  }), [session, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth(): AuthValue {
  const v = useContext(AuthContext);
  if (!v) throw new Error('useAuth outside AuthProvider');
  return v;
}

export type Profile = { id: string; display_name: string | null };
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase.from('profiles').select('id, display_name').eq('id', userId).maybeSingle();
  return (data as Profile | null) ?? null;
}
export async function setDisplayName(userId: string, name: string) {
  const { error } = await supabase.from('profiles').update({ display_name: name }).eq('id', userId);
  if (error) throw new Error(error.message);
}
