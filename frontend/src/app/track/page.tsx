'use client';
import { FormEvent, useState } from 'react';
import { api, ApiError, fmtDate } from '@/lib/api';
import { HistoryItem, Status } from '@/types';
import { StatusBadge } from '@/components/StatusBadge';
import { Timeline } from '@/components/Timeline';

interface Tracked { reference_id: string; district: string; category: string; subject: string; status: Status; created_at: string; updated_at: string; assigned_department: string | null; history: HistoryItem[] }

export default function Track() {
  const [ref, setRef] = useState('');
  const [data, setData] = useState<Tracked | null>(null);
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);

  async function search(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError(''); setData(null);
    try { setData(await api.get<Tracked>(`/grievances/track/${encodeURIComponent(ref.trim())}`)); }
    catch (err) { setError((err as ApiError).message); }
    finally { setBusy(false); }
  }
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="h1 mb-4">Track your grievance</h1>
      <form onSubmit={search} className="card flex gap-2">
        <input className="input" placeholder="e.g. CMK-2026-001000" required value={ref} onChange={(e) => setRef(e.target.value)} />
        <button className="btn-primary" disabled={busy}>{busy ? 'Searching…' : 'Track'}</button>
      </form>
      {error && <p className="mt-4 text-red-600">{error}</p>}
      {data && (
        <div className="card mt-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div><div className="font-mono text-sm text-gray-500">{data.reference_id}</div><h2 className="text-lg font-semibold">{data.subject}</h2></div>
            <StatusBadge status={data.status} />
          </div>
          <dl className="grid gap-2 text-sm sm:grid-cols-3">
            <div><dt className="muted">District</dt><dd>{data.district}</dd></div>
            <div><dt className="muted">Assigned department</dt><dd>{data.assigned_department ?? 'Not yet assigned'}</dd></div>
            <div><dt className="muted">Last updated</dt><dd>{fmtDate(data.updated_at)}</dd></div>
          </dl>
          <h3 className="font-semibold text-brand-800">Status history</h3>
          <Timeline history={data.history} />
        </div>
      )}
    </div>
  );
}
