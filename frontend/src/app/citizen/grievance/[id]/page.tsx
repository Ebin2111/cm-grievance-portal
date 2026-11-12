'use client';
import { useParams, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { api, ApiError, fmtDay, openAttachment } from '@/lib/api';
import { useRequireRole } from '@/lib/auth';
import { GrievanceDetail } from '@/types';
import { PriorityBadge, StatusBadge } from '@/components/StatusBadge';
import { Timeline } from '@/components/Timeline';

export default function CitizenGrievance() {
  const user = useRequireRole('CITIZEN');
  const { id } = useParams<{ id: string }>();
  const submitted = useSearchParams().get('submitted');
  const [g, setG] = useState<GrievanceDetail | null>(null);
  const [error, setError] = useState(''); const [note, setNote] = useState('');
  const [rating, setRating] = useState(5); const [comment, setComment] = useState(''); const [reason, setReason] = useState('');

  const load = useCallback(() => api.get<GrievanceDetail>(`/grievances/${id}`).then(setG).catch((e) => setError(e.message)), [id]);
  useEffect(() => { if (user) load(); }, [user, load]);

  async function act(fn: () => Promise<unknown>, okMsg: string) {
    setError(''); setNote('');
    try { await fn(); setNote(okMsg); await load(); } catch (e) { setError((e as ApiError).message); }
  }
  if (!user || !g) return <p className={error ? 'text-red-600' : 'muted'}>{error || 'Loading…'}</p>;

  const report = g.assignments.find((a) => a.is_active)?.action_taken_report;
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {submitted && <div className="rounded-md border border-green-300 bg-green-50 p-4 text-green-800">Grievance submitted. Your reference number is <b className="font-mono">{submitted}</b>. Keep it to track progress.</div>}
      {note && <p className="text-green-700">{note}</p>}{error && <p className="text-red-600">{error}</p>}
      <div className="card space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div><div className="font-mono text-sm text-gray-500">{g.reference_id}</div><h1 className="text-xl font-bold text-brand-900">{g.subject}</h1></div>
          <div className="flex gap-2"><PriorityBadge priority={g.priority} /><StatusBadge status={g.status} /></div>
        </div>
        <p className="muted">{g.district} · {g.category} · Submitted {fmtDay(g.created_at)} · Target date {fmtDay(g.due_date)}</p>
        <p className="whitespace-pre-wrap text-sm">{g.description}</p>
        {g.assignments.find((a) => a.is_active) && <p className="text-sm"><span className="muted">Assigned department: </span>{g.assignments.find((a) => a.is_active)!.department_name}</p>}
        {g.attachments.length > 0 && <div className="text-sm"><span className="muted">Attachments: </span>
          {g.attachments.map((a) => <button key={a.id} className="mr-3 text-brand-700 underline" onClick={() => openAttachment(a.id).catch((e) => setError(e.message))}>{a.file_name}</button>)}</div>}
        {g.ai_summary && <p className="rounded bg-gray-50 p-2 text-xs text-gray-600">{g.ai_is_fallback ? 'Rule-based fallback (AI unavailable)' : 'AI-assisted'} summary for the CMO: {g.ai_summary}</p>}
      </div>

      {g.status === 'RESOLVED' && report && <div className="card"><h2 className="mb-1 font-semibold text-brand-800">Action taken by the department</h2><p className="whitespace-pre-wrap text-sm">{report}</p></div>}

      <div className="card"><h2 className="mb-3 font-semibold text-brand-800">Status history and remarks</h2><Timeline history={g.history} /></div>

      {g.status === 'RESOLVED' && (
        <div className="card space-y-4">
          <h2 className="font-semibold text-brand-800">Your feedback</h2>
          {g.feedback && <p className="text-sm">Submitted: {'★'.repeat(g.feedback.rating)} {g.feedback.comment}</p>}
          <div className="grid gap-2 sm:grid-cols-[120px_1fr_auto]">
            <select className="input" value={rating} onChange={(e) => setRating(+e.target.value)}>{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>)}</select>
            <input className="input" placeholder="Comment (optional)" value={comment} onChange={(e) => setComment(e.target.value)} />
            <button className="btn-primary" onClick={() => act(() => api.post(`/grievances/${id}/feedback`, { rating, comment: comment || undefined }), 'Thank you for your feedback')}>{g.feedback ? 'Update' : 'Send'} feedback</button>
          </div>
          <div className="border-t pt-4">
            <h3 className="mb-2 text-sm font-medium">Not satisfied? Reopen this grievance</h3>
            <div className="flex gap-2"><input className="input" placeholder="Reason (min 5 characters)" value={reason} onChange={(e) => setReason(e.target.value)} />
              <button className="btn-danger" disabled={reason.trim().length < 5} onClick={() => act(() => api.post(`/grievances/${id}/reopen`, { reason }), 'Grievance reopened')}>Reopen</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
