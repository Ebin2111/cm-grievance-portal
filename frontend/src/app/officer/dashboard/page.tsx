'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useRequireRole } from '@/lib/auth';
import { GrievanceRow } from '@/types';
import { StatCard } from '@/components/StatCard';
import { GrievanceTable } from '@/components/GrievanceTable';

export default function OfficerDashboard() {
  const user = useRequireRole('OFFICER');
  const [rows, setRows] = useState<GrievanceRow[]>([]);
  const [error, setError] = useState('');
  useEffect(() => { if (user) api.get<GrievanceRow[]>('/officer/grievances').then(setRows).catch((e) => setError(e.message)); }, [user]);
  if (!user) return <p className="muted">Loading…</p>;

  const open = rows.filter((r) => r.status === 'IN_PROGRESS').length;
  const awaiting = rows.filter((r) => r.status === 'UNDER_REVIEW').length;
  return (
    <div className="space-y-6">
      <div><h1 className="h1">Officer dashboard</h1><p className="muted">Grievances forwarded to your department</p></div>
      {error && <p className="text-red-600">{error}</p>}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Forwarded" value={rows.length} />
        <StatCard label="Action needed" value={open} tone="warn" />
        <StatCard label="Awaiting CMO review" value={awaiting} />
      </div>
      <div className="card"><GrievanceTable rows={rows} base="/officer/grievance" /></div>
    </div>
  );
}
