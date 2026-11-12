'use client';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts';

type Point = { name: string; value: number };
const COLORS = ['#1f6f54', '#d97706', '#2563eb', '#dc2626', '#7c3aed', '#0891b2', '#65a30d', '#db2777'];

export function BarPanel({ title, data, horizontal = false }: { title: string; data: Point[]; horizontal?: boolean }) {
  return (
    <div className="card">
      <h3 className="mb-3 font-semibold text-brand-900">{title}</h3>
      {!data.length ? <p className="muted">No data yet.</p> : (
        <ResponsiveContainer width="100%" height={horizontal ? Math.max(220, data.length * 30) : 260}>
          <BarChart data={data} layout={horizontal ? 'vertical' : 'horizontal'} margin={{ left: horizontal ? 60 : 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            {horizontal ? <><XAxis type="number" allowDecimals={false} /><YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11 }} /></>
              : <><XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-30} textAnchor="end" height={70} /><YAxis allowDecimals={false} /></>}
            <Tooltip />
            <Bar dataKey="value" fill="#1f6f54" radius={3} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export function PiePanel({ title, data }: { title: string; data: Point[] }) {
  return (
    <div className="card">
      <h3 className="mb-3 font-semibold text-brand-900">{title}</h3>
      {!data.length ? <p className="muted">No data yet.</p> : (
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" outerRadius={85} label>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip /><Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
