'use client';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { useRequireRole } from '@/lib/auth';
import { AiSuggestion } from '@/types';
import { AiSuggestionCard } from '@/components/AiSuggestionCard';

export default function SubmitGrievance() {
  const user = useRequireRole('CITIZEN');
  const router = useRouter();
  const [meta, setMeta] = useState<{ districts: string[]; categories: string[] }>({ districts: [], categories: [] });
  const [f, setF] = useState({ district: '', category: '', subject: '', description: '' });
  const [files, setFiles] = useState<File[]>([]);
  const [ai, setAi] = useState<AiSuggestion | null>(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);

  useEffect(() => { api.get<typeof meta>('/meta').then(setMeta).catch(() => {}); }, []);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  async function analyze() {
    setAiBusy(true); setError('');
    try { setAi(await api.post<AiSuggestion>('/ai/analyze', { description: f.description, district: f.district || undefined })); }
    catch (e) { setError((e as ApiError).message); }
    finally { setAiBusy(false); }
  }

  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError('');
    const body = new FormData();
    Object.entries(f).forEach(([k, v]) => body.append(k, v));
    files.forEach((file) => body.append('attachments', file));
    try {
      const r = await api.post<{ id: string; referenceId: string }>('/grievances', body);
      router.push(`/citizen/grievance/${r.id}?submitted=${r.referenceId}`);
    } catch (err) { setError((err as ApiError).message); setBusy(false); }
  }

  if (!user) return <p className="muted">Loading…</p>;
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="h1 mb-1">Submit a grievance</h1>
      <p className="muted mb-4">Prototype only: please use fictional details.</p>
      <form onSubmit={submit} className="card space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label">District</label>
            <select className="input" required value={f.district} onChange={set('district')}><option value="">Select district</option>{meta.districts.map((d) => <option key={d}>{d}</option>)}</select></div>
          <div><label className="label">Category</label>
            <select className="input" required value={f.category} onChange={set('category')}><option value="">Select category</option>{meta.categories.map((c) => <option key={c}>{c}</option>)}</select></div>
        </div>
        <div><label className="label">Subject</label><input className="input" required minLength={5} maxLength={150} value={f.subject} onChange={set('subject')} /></div>
        <div><label className="label">Detailed description</label>
          <textarea className="input" rows={6} required minLength={20} maxLength={4000} value={f.description} onChange={set('description')} placeholder="Describe the problem, where it is and since when." /></div>

        <div>
          <button type="button" className="btn-outline" disabled={aiBusy || f.description.trim().length < 20} onClick={analyze}>{aiBusy ? 'Analysing…' : 'Get AI suggestions'}</button>
          <span className="muted ml-3">Optional. Needs at least 20 characters.</span>
        </div>
        {ai && <AiSuggestionCard s={ai} onApply={() => meta.categories.includes(ai.category) && setF({ ...f, category: ai.category })} />}

        <div><label className="label">Supporting image / document (optional, JPG, PNG or PDF, max 5 MB each, up to 3)</label>
          <input type="file" multiple accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => setFiles(Array.from(e.target.files ?? []).slice(0, 3))} className="text-sm" /></div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="btn-primary" disabled={busy}>{busy ? 'Submitting…' : 'Submit grievance'}</button>
      </form>
    </div>
  );
}
