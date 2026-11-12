'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useRequireRole } from '@/lib/auth';
import { CmoStats, GrievanceRow } from '@/types';
import { StatCard } from '@/components/StatCard';
import { GrievanceTable } from '@/components/GrievanceTable';
import { EMPTY_FILTERS, FilterBar, Filters } from '@/components/FilterBar';
import { BarPanel, PiePanel } from '@/components/Charts';

export default function CmoDashboard() {
  const user = useRequireRole('CMO_ADMIN');
  const [stats, setStats] = useState<CmoStats | null>(null);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [list, setList] = useState<{ items: GrievanceRow[]; total: number; pageSize: number } | null>(null);
  const [meta, setMeta] = useState({ districts: [] as string[], categories: [] as string[] });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    api.get<CmoStats>('/cmo/stats').then(setStats).catch((e) => setError(e.message));
    api.get<typeof meta>('/meta').then(setMeta).catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const q = new URLSearchParams({ page: String(page) });
    Object.entries(filters).forEach(([k, v]) => v && q.set(k, v));
    api.get<typeof list>(`/cmo/grievances?${q}`).then(setList).catch((e) => setError(e.message));
  }, [user, filters, page]);

  if (!user) return <p className="muted">Loading…</p>;
  const pages = list ? Math.max(1, Math.ceil(list.total / list.pageSize)) : 1;
  return (
    <div className="space-y-6">
      <h1 className="h1">CMO dashboard</h1>
      {error && <p className="text-red-600">{error}</p>}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total" value={stats?.totals.total ?? '–'} />
        <StatCard label="Pending" value={stats?.totals.pending ?? '–'} tone="warn" />
        <StatCard label="Resolved" value={stats?.totals.resolved ?? '–'} tone="good" />
        <StatCard label="Overdue" value={stats?.totals.overdue ?? '–'} tone="bad" />
      </div>
      {stats && (
        <div className="grid gap-4 lg:grid-cols-2">
          <BarPanel title="Grievances by district" data={stats.byDistrict} horizontal />
          <BarPanel title="Grievances by department (active assignments)" data={stats.byDepartment} horizontal />
          <PiePanel title="By status" data={stats.byStatus} />
          <PiePanel title="By priority" data={stats.byPriority} />
        </div>
      )}
      <div className="card space-y-4">
        <h2 className="font-semibold text-brand-800">All grievances</h2>
        <FilterBar value={filters} onChange={(f) => { setFilters(f); setPage(1); }} districts={meta.districts} categories={meta.categories} />
        <GrievanceTable rows={list?.items ?? []} base="/cmo/grievance" />
        <div className="flex items-center justify-between text-sm">
          <span className="muted">{list?.total ?? 0} result(s)</span>
          <div className="flex items-center gap-2">
            <button className="btn-outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
            <span>Page {page} / {pages}</span>
            <button className="btn-outline" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
