'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { homeFor, useAuth } from '@/lib/auth';

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError('');
    try { const u = await login(email, password); router.push(homeFor(u.role)); }
    catch (err) { setError((err as Error).message); setBusy(false); }
  }
  return (
    <div className="mx-auto max-w-md">
      <h1 className="h1 mb-4">Login</h1>
      <form onSubmit={submit} className="card space-y-4">
        <div><label className="label">Email</label><input type="email" className="input" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div><label className="label">Password</label><input type="password" className="input" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="btn-primary w-full" disabled={busy}>{busy ? 'Signing in…' : 'Login'}</button>
        <p className="muted">New citizen? <Link className="text-brand-700 underline" href="/register">Register</Link></p>
      </form>
      <div className="card mt-4 text-sm">
        <div className="font-semibold text-brand-800">Demo accounts (password: Demo@12345)</div>
        <ul className="mt-1 space-y-0.5 text-gray-700">
          <li>Citizen: citizen@demo.test</li><li>CMO admin: cmo@demo.test</li><li>Officer (PWD): officer.pwd@demo.test</li>
        </ul>
      </div>
    </div>
  );
}
