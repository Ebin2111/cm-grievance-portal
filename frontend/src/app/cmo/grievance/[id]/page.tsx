'use client';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { api, ApiError, fmtDay, openAttachment } from '@/lib/api';
import { useRequireRole } from '@/lib/auth';
import { Department, GrievanceDetail } from '@/types';
import { PriorityBadge, StatusBadge, label } from '@/components/StatusBadge';
import { Timeline } from '@/components/Timeline';

interface Officer { id: string; name: string; department_id: string }

export default function CmoGrievance() {
  const user = useRequireRole('CMO_ADMIN');
  const { id } = useParams<{ id: string }>();
  const [g, setG] = useState<GrievanceDetail | null>(null);
  const [depts, setDepts] = useState<Department[]>([]); const [officers, setOfficers] = useState<Officer[]>([]);
  const [deptId, setDeptId] = useState(''); const [officerId, setOfficerId] = useState('');
  const [remark, setRemark] = useState(''); const [reviewNote, setReviewNote] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);

  const load = useCallback(() => api.get<GrievanceDetail>(`/grievances/${id}`).then(setG).catch((e) => setMsg({ ok: false, t: e.message })), [id]);
  useEffect(() => {
    if (!user) return;
    load();
    api.get<Department[]>('/departments').then(setDepts).catch(() => {});
    api.get<Officer[]>('/cmo/officers').then(setOfficers).catch(() => {});
  }, [user, load]);

  async function act(fn: () => Promise<unknown>, ok: string) {
    setMsg(null);
    try { await fn(); setMsg({ ok: true, t: ok }); await load(); } catch (e) { setMsg({ ok: false, t: (e as ApiError).message }); }
  }
  if (!user || !g) return <p className="muted">{msg?.t || 'Loading…'}</p>;

  const active = g.assignments.find((a) => a.is_active);
  const canAssign = ['SUBMITTED', 'UNDER_REVIEW', 'REOPENED'].includes(g.status);
  const canReview = g.status === 'UNDER_REVIEW' && !!active?.submitted_at;
  const aiDeptId = depts.find((d) => d.name === g.ai_suggested_department)?.id;

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2">
        {msg && <p className={msg.ok ? 'text-green-700' : 'text-red-600'}>{msg.t}</p>}
        <div className="card space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div><div className="font-mono text-sm text-gray-500">{g.reference_id}</div><h1 className="text-xl font-bold text-brand-900">{g.subject}</h1></div>
            <div className="flex flex-wrap gap-2">{g.is_escalated && <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs text-red-700">Escalated</span>}<PriorityBadge priority={g.priority} /><StatusBadge status={g.status} /></div>
          </div>
          <p className="muted">{g.district} · {g.category} · Due {fmtDay(g.due_date)} · Citizen: {g.citizen_name} ({g.citizen_mobile})</p>
          <p className="whitespace-pre-wrap text-sm">{g.description}</p>
          {g.attachments.length > 0 && <div className="text-sm"><span className="muted">Attachments: </span>
            {g.attachments.map((a) => <button key={a.id} className="mr-3 text-brand-700 underline" onClick={() => openAttachment(a.id).catch((e) => setMsg({ ok: false, t: e.message }))}>{a.file_name}</button>)}</div>}
        </div>

        <div className={`card ${g.ai_is_fallback ? 'border-amber-300 bg-amber-50' : 'bg-brand-50'}`}>
          <div className="mb-1 flex items-center justify-between"><h2 className="font-semibold text-brand-900">AI suggestion (for your review)</h2>
            <span className="text-xs">{g.ai_is_fallback ? 'Rule-based fallback (AI unavailable)' : 'AI model output'}</span></div>
          <p className="text-sm"><b>Dept:</b> {g.ai_suggested_department ?? '–'} · <b>Category:</b> {g.ai_suggested_category ?? '–'} · <b>Priority:</b> {g.ai_suggested_priority ? label(g.ai_suggested_priority) : '–'}</p>
          <p className="mt-1 text-sm"><b>Summary:</b> {g.ai_summary}</p>
          {g.possible_duplicate_of && <p className="mt-2 rounded bg-white p-2 text-sm text-amber-800">Flagged as a possible duplicate of another grievance. Please review manually.</p>}
          <p className="muted mt-1 text-xs">Suggestions only. You make the final decision.</p>
        </div>

        {active && <div className="card"><h2 className="mb-1 font-semibold text-brand-800">Department: {active.department_name}</h2>
          <p className="muted">Officer: {active.officer_name ?? 'Not set'} · Assigned {fmtDay(active.assigned_at)}</p>
          <h3 className="mt-3 text-sm font-medium">Action-taken report</h3>
          <p className="whitespace-pre-wrap text-sm">{active.action_taken_report ?? 'Not submitted yet.'}</p>
          {active.submitted_at && <p className="muted mt-1">Submitted {fmtDay(active.submitted_at)}</p>}</div>}

        <div className="card"><h2 className="mb-3 font-semibold text-brand-800">Status history</h2><Timeline history={g.history} /></div>
      </div>

      <aside className="space-y-5">
        {g.status === 'SUBMITTED' && <div className="card"><button className="btn-primary w-full" onClick={() => act(() => api.patch(`/cmo/grievances/${id}`, { startReview: true }), 'Marked Under Review')}>Start review</button></div>}

        {canAssign && (
          <div className="card space-y-3"><h2 className="font-semibold text-brand-800">Forward to department</h2>
            <select className="input" value={deptId} onChange={(e) => { setDeptId(e.target.value); setOfficerId(''); }}>
              <option value="">Select department</option>{depts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
            {aiDeptId && deptId !== aiDeptId && <button className="muted underline" onClick={() => setDeptId(aiDeptId)}>Use AI suggestion ({g.ai_suggested_department})</button>}
            <select className="input" value={officerId} onChange={(e) => setOfficerId(e.target.value)} disabled={!deptId}>
              <option value="">Any officer in department</option>{officers.filter((o) => o.department_id === deptId).map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</select>
            <button className="btn-primary w-full" disabled={!deptId} onClick={() => act(() => api.post(`/cmo/grievances/${id}/assign`, { departmentId: deptId, officerId: officerId || undefined }), 'Forwarded to department')}>Forward</button>
          </div>)}

        {canReview && (
          <div className="card space-y-3"><h2 className="font-semibold text-brand-800">Review report</h2>
            <textarea className="input" rows={3} placeholder="Remarks (optional)" value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} />
            <div className="flex gap-2">
              <button className="btn-primary flex-1" onClick={() => act(() => api.post(`/cmo/grievances/${id}/review-report`, { approve: true, remarks: reviewNote || undefined }), 'Approved: grievance resolved')}>Approve</button>
              <button className="btn-outline flex-1" onClick={() => act(() => api.post(`/cmo/grievances/${id}/review-report`, { approve: false, remarks: reviewNote || undefined }), 'Returned to department')}>Return</button></div>
          </div>)}

        <div className="card space-y-3"><h2 className="font-semibold text-brand-800">Priority</h2>
          <select className="input" value={g.priority} onChange={(e) => act(() => api.patch(`/cmo/grievances/${id}`, { priority: e.target.value }), 'Priority updated')}>
            {['LOW', 'MEDIUM', 'HIGH'].map((p) => <option key={p} value={p}>{label(p)}</option>)}</select></div>

        <div className="card space-y-3"><h2 className="font-semibold text-brand-800">Internal remark</h2>
          {g.cmo_remarks && <p className="rounded bg-gray-50 p-2 text-sm">{g.cmo_remarks}</p>}
          <textarea className="input" rows={3} placeholder="Visible to CMO staff only" value={remark} onChange={(e) => setRemark(e.target.value)} />
          <button className="btn-outline w-full" disabled={remark.trim().length < 2} onClick={() => act(async () => { await api.post(`/cmo/grievances/${id}/remarks`, { remarks: remark }); setRemark(''); }, 'Remark saved')}>Save remark</button></div>

        {g.status !== 'RESOLVED' && !g.is_escalated && (
          <div className="card"><h2 className="mb-2 font-semibold text-brand-800">Delayed?</h2>
            <button className="btn-danger w-full" onClick={() => act(() => api.post(`/cmo/grievances/${id}/escalate`, {}), 'Escalated')}>Escalate (sets priority High)</button></div>)}
      </aside>
    </div>
  );
}
