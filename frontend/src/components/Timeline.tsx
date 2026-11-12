import { HistoryItem } from '@/types';
import { fmtDate } from '@/lib/api';
import { StatusBadge } from './StatusBadge';

export function Timeline({ history }: { history: HistoryItem[] }) {
  return (
    <ol className="relative ml-2 border-l-2 border-brand-100">
      {history.map((h, i) => (
        <li key={i} className="mb-5 ml-5">
          <span className="absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full bg-brand-600" />
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={h.to_status} />
            <span className="muted">{fmtDate(h.changed_at)}</span>
            {h.changed_by_name && <span className="muted">· {h.changed_by_name}</span>}
          </div>
          {h.remarks && <p className="mt-1 text-sm text-gray-700">{h.remarks.replace(/^\[INTERNAL\]\s*/, 'Internal note: ')}</p>}
        </li>
      ))}
    </ol>
  );
}
