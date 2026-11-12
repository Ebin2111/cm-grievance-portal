'use client';
import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { api, TOKEN_KEY } from './api';
import { Role, User } from '@/types';

interface AuthCtx {
  user: User | null; ready: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (b: { name: string; email: string; mobile: string; password: string }) => Promise<User>;
  logout: () => void;
}
const Ctx = createContext<AuthCtx>(null as unknown as AuthCtx);
export const useAuth = () => useContext(Ctx);

export const homeFor = (role: Role) => (role === 'CMO_ADMIN' ? '/cmo/dashboard' : role === 'OFFICER' ? '/officer/dashboard' : '/citizen/dashboard');

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) { setReady(true); return; }
    api.get<User>('/auth/me').then(setUser).catch(() => localStorage.removeItem(TOKEN_KEY)).finally(() => setReady(true));
  }, []);

  const finish = (d: { token: string; user: User }) => { localStorage.setItem(TOKEN_KEY, d.token); setUser(d.user); return d.user; };
  const login = useCallback(async (email: string, password: string) => finish(await api.post('/auth/login', { email, password })), []);
  const register = useCallback(async (b: { name: string; email: string; mobile: string; password: string }) => finish(await api.post('/auth/register', b)), []);
  const logout = useCallback(() => { api.post('/auth/logout').catch(() => {}); localStorage.removeItem(TOKEN_KEY); setUser(null); }, []);

  return <Ctx.Provider value={{ user, ready, login, register, logout }}>{children}</Ctx.Provider>;
}

/** Client-side role guard (the API enforces the real authorisation). Returns the user once allowed. */
export function useRequireRole(...roles: Role[]) {
  const { user, ready } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace('/login');
    else if (!roles.includes(user.role)) router.replace(homeFor(user.role));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, user]);
  return ready && user && roles.includes(user.role) ? user : null;
}
