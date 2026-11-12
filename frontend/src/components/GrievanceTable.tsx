import Link from 'next/link';
import { GrievanceRow } from '@/types';
import { fmtDay } from '@/lib/api';
import { PriorityBadge, StatusBadge } from './StatusBadge';

export function GrievanceTable({ rows, base, showPriority = true }: { rows: GrievanceRow[]; base: string; showPriority?: boolean }) {
  if (!rows.length) return <p className="muted py-6 text-center">No grievances found.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
          <tr><th className="p-3">Reference</th><th className="p-3">Subject</th><th className="p-3">District</th><th className="p-3">Category</th>
            {showPriority && <th className="p-3">Priority</th>}<th className="p-3">Status</th><th className="p-3">Due</th></tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b hover:bg-gray-50">
              <td className="p-3 font-mono text-xs"><Link className="text-brand-700 underline" href={`${base}/${r.id}`}>{r.reference_id}</Link></td>
              <td className="p-3">{r.subject}
                {r.is_escalated && <span className="ml-2 rounded bg-red-100 px-1.5 text-xs text-red-700">Escalated</span>}
                {r.possible_duplicate && <span className="ml-2 rounded bg-amber-100 px-1.5 text-xs text-amber-800">Possible duplicate</span>}
              </td>
              <td className="p-3">{r.district}</td><td className="p-3">{r.category}</td>
              {showPriority && <td className="p-3"><PriorityBadge priority={r.priority} /></td>}
              <td className="p-3"><StatusBadge status={r.status} /></td>
              <td className={`p-3 ${r.overdue ? 'font-medium text-red-600' : ''}`}>{fmtDay(r.due_date)}{r.overdue ? ' (overdue)' : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
