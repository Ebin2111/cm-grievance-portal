'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Department } from '@/types';

export default function Departments() {
  const [depts, setDepts] = useState<Department[] | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { api.get<Department[]>('/departments').then(setDepts).catch((e) => setError(e.message)); }, []);
  return (
    <div>
      <h1 className="h1 mb-2">Departments</h1>
      <p className="muted mb-6">Sample (fictional) departments that receive forwarded grievances.</p>
      {error && <p className="text-red-600">{error}</p>}
      {!depts && !error && <p className="muted">Loading…</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {depts?.map((d) => <div key={d.id} className="card"><h2 className="font-semibold text-brand-800">{d.name}</h2><p className="muted mt-1">{d.description}</p></div>)}
      </div>
    </div>
  );
}
