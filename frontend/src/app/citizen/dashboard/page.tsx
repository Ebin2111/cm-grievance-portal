'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useRequireRole } from '@/lib/auth';
import { GrievanceRow } from '@/types';
import { StatCard } from '@/components/StatCard';
import { GrievanceTable } from '@/components/GrievanceTable';

export default function CitizenDashboard() {
  const user = useRequireRole('CITIZEN');
  const [data, setData] = useState<{ grievances: GrievanceRow[]; counts: { total: number; pending: number; resolved: number } } | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { if (user) api.get<typeof data>('/grievances/my').then(setData).catch((e) => setError(e.message)); }, [user]);
  if (!user) return <p className="muted">Loading…</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="h1">Welcome, {user.name}</h1><p className="muted">Your submitted grievances</p></div>
        <Link href="/citizen/submit" className="btn-primary">Submit new grievance</Link>
      </div>
      {error && <p className="text-red-600">{error}</p>}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Submitted" value={data?.counts.total ?? '–'} />
        <StatCard label="Pending" value={data?.counts.pending ?? '–'} tone="warn" />
        <StatCard label="Resolved" value={data?.counts.resolved ?? '–'} tone="good" />
      </div>
      <div className="card"><GrievanceTable rows={data?.grievances ?? []} base="/citizen/grievance" showPriority={false} /></div>
    </div>
  );
}
