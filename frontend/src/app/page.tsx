'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Department } from '@/types';
import { StatCard } from '@/components/StatCard';

export default function Home() {
  const [stats, setStats] = useState<{ total: number; resolved: number; in_progress: number; departments: number } | null>(null);
  const [depts, setDepts] = useState<Department[]>([]);
  useEffect(() => {
    api.get<typeof stats>('/stats/public').then(setStats).catch(() => {});
    api.get<Department[]>('/departments').then((d) => setDepts(d.slice(0, 4))).catch(() => {});
  }, []);

  return (
    <div className="space-y-12">
      <section className="rounded-xl bg-brand-900 px-6 py-14 text-center text-white">
        <h1 className="text-3xl font-bold sm:text-4xl">Chief Minister&apos;s Public Grievance Redressal Portal</h1>
        <p className="mx-auto mt-3 max-w-2xl text-brand-100">Submit a grievance, watch it move from the Chief Minister&apos;s Office to the right department, and see the outcome. (Demonstration prototype.)</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/citizen/submit" className="btn bg-white text-brand-900 hover:bg-brand-50">Submit Grievance</Link>
          <Link href="/track" className="btn border border-white text-white hover:bg-brand-800">Track Grievance</Link>
        </div>
      </section>

      <section>
        <h2 className="h1 mb-4">Sample statistics</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Grievances received" value={stats?.total ?? '–'} />
          <StatCard label="Resolved" value={stats?.resolved ?? '–'} tone="good" />
          <StatCard label="In progress" value={stats?.in_progress ?? '–'} tone="warn" />
          <StatCard label="Departments" value={stats?.departments ?? '–'} />
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between"><h2 className="h1">Featured departments</h2><Link href="/departments" className="text-sm text-brand-700 underline">View all</Link></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {depts.map((d) => <div key={d.id} className="card"><h3 className="font-semibold text-brand-800">{d.name}</h3><p className="muted mt-1">{d.description}</p></div>)}
        </div>
      </section>
    </div>
  );
}
