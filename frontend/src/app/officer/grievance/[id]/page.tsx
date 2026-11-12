'use client';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { api, ApiError, fmtDay, openAttachment } from '@/lib/api';
import { useRequireRole } from '@/lib/auth';
import { GrievanceDetail } from '@/types';
import { PriorityBadge, StatusBadge } from '@/components/StatusBadge';
import { Timeline } from '@/components/Timeline';

export default function OfficerGrievance() {
  const user = useRequireRole('OFFICER');
  const { id } = useParams<{ id: string }>();
  const [g, setG] = useState<GrievanceDetail | null>(null);
  const [progress, setProgress] = useState(''); const [report, setReport] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);

  const load = useCallback(() => api.get<GrievanceDetail>(`/grievances/${id}`).then((d) => {
    setG(d); setReport((r) => r || d.assignments.find((a) => a.is_active)?.action_taken_report || '');
  }).catch((e) => setMsg({ ok: false, t: e.message })), [id]);
  useEffect(() => { if (user) load(); }, [user, load]);

  async function act(fn: () => Promise<unknown>, ok: string) {
    setMsg(null);
    try { await fn(); setMsg({ ok: true, t: ok }); await load(); } catch (e) { setMsg({ ok: false, t: (e as ApiError).message }); }
  }
  if (!user || !g) return <p className="muted">{msg?.t || 'Loading…'}</p>;

  const active = g.assignments.find((a) => a.is_active);
  const editable = g.status === 'IN_PROGRESS';
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2">
        {msg && <p className={msg.ok ? 'text-green-700' : 'text-red-600'}>{msg.t}</p>}
        <div className="card space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div><div className="font-mono text-sm text-gray-500">{g.reference_id}</div><h1 className="text-xl font-bold text-brand-900">{g.subject}</h1></div>
            <div className="flex gap-2"><PriorityBadge priority={g.priority} /><StatusBadge status={g.status} /></div>
          </div>
          <p className="muted">{g.district} · {g.category} · Due {fmtDay(g.due_date)}</p>
          <p className="whitespace-pre-wrap text-sm">{g.description}</p>
          {g.attachments.length > 0 && <div className="text-sm"><span className="muted">Attachments: </span>
            {g.attachments.map((a) => <button key={a.id} className="mr-3 text-brand-700 underline" onClick={() => openAttachment(a.id).catch((e) => setMsg({ ok: false, t: e.message }))}>{a.file_name}</button>)}</div>}
        </div>
        <div className="card"><h2 className="mb-3 font-semibold text-brand-800">Status history</h2><Timeline history={g.history} /></div>
      </div>

      <aside className="space-y-5">
        {!editable && <div className="card text-sm text-gray-700">{g.status === 'UNDER_REVIEW' ? 'Your report is with the CMO for review.' : 'No action required right now.'}</div>}
        {editable && (
          <>
            <div className="card space-y-3"><h2 className="font-semibold text-brand-800">Investigation update</h2>
              <textarea className="input" rows={3} placeholder="Progress remarks" value={progress} onChange={(e) => setProgress(e.target.value)} />
              <button className="btn-outline w-full" disabled={progress.trim().length < 2} onClick={() => act(async () => { await api.patch(`/officer/grievances/${id}/status`, { remarks: progress }); setProgress(''); }, 'Progress update recorded')}>Post update</button></div>
            <div className="card space-y-3"><h2 className="font-semibold text-brand-800">Action-taken report</h2>
              <textarea className="input" rows={6} placeholder="Describe the action taken (min 10 characters)" value={report} onChange={(e) => setReport(e.target.value)} />
              <button className="btn-outline w-full" disabled={report.trim().length < 10} onClick={() => act(() => api.post(`/officer/grievances/${id}/action-report`, { report }), 'Report saved')}>Save report</button>
              <button className="btn-primary w-full" disabled={!active?.action_taken_report} onClick={() => act(() => api.post(`/officer/grievances/${id}/submit`, {}), 'Submitted to the CMO for review')}>Submit to CMO for review</button>
              <p className="muted text-xs">Save the report first, then submit.</p></div>
          </>
        )}
      </aside>
    </div>
  );
}
