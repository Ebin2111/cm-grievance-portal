'use client';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { homeFor, useAuth } from '@/lib/auth';
import { ApiError } from '@/lib/api';

export default function Register() {
  const { register } = useAuth();
  const router = useRouter();
  const [f, setF] = useState({ name: '', email: '', mobile: '', password: '' });
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError('');
    try { const u = await register(f); router.push(homeFor(u.role)); }
    catch (err) { setError((err as ApiError).message); setBusy(false); }
  }
  return (
    <div className="mx-auto max-w-md">
      <h1 className="h1 mb-4">Citizen registration</h1>
      <form onSubmit={submit} className="card space-y-4">
        <div><label className="label">Full name</label><input className="input" required value={f.name} onChange={set('name')} /></div>
        <div><label className="label">Email</label><input type="email" className="input" required value={f.email} onChange={set('email')} /></div>
        <div><label className="label">Mobile number</label><input className="input" required inputMode="numeric" maxLength={10} placeholder="10-digit number" value={f.mobile} onChange={set('mobile')} /></div>
        <div><label className="label">Password (min 8 characters)</label><input type="password" className="input" required minLength={8} value={f.password} onChange={set('password')} /></div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <p className="muted">Use fictional details only. This is a prototype.</p>
        <button className="btn-primary w-full" disabled={busy}>{busy ? 'Creating account…' : 'Register'}</button>
      </form>
    </div>
  );
}
