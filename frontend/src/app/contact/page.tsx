'use client';
import { FormEvent, useState } from 'react';
import { api, ApiError } from '@/lib/api';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });

  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setMsg(null);
    try { await api.post('/contact', form); setMsg({ ok: true, text: 'Thank you. Your enquiry has been recorded.' }); setForm({ name: '', email: '', subject: '', message: '' }); }
    catch (err) { setMsg({ ok: false, text: (err as ApiError).message }); }
    finally { setBusy(false); }
  }
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="h1 mb-4">Contact us</h1>
      <form onSubmit={submit} className="card space-y-4">
        <div><label className="label">Name</label><input className="input" required value={form.name} onChange={set('name')} /></div>
        <div><label className="label">Email</label><input type="email" className="input" required value={form.email} onChange={set('email')} /></div>
        <div><label className="label">Subject</label><input className="input" required value={form.subject} onChange={set('subject')} /></div>
        <div><label className="label">Message</label><textarea className="input" rows={5} required minLength={10} value={form.message} onChange={set('message')} /></div>
        {msg && <p className={msg.ok ? 'text-green-700' : 'text-red-600'}>{msg.text}</p>}
        <button className="btn-primary" disabled={busy}>{busy ? 'Sending…' : 'Send message'}</button>
      </form>
    </div>
  );
}
