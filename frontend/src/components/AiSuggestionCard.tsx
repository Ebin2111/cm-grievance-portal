import { AiSuggestion } from '@/types';
import { label } from './StatusBadge';

export function AiSuggestionCard({ s, onApply }: { s: AiSuggestion; onApply?: () => void }) {
  return (
    <div className={`rounded-lg border p-4 ${s.isFallback ? 'border-amber-300 bg-amber-50' : 'border-brand-100 bg-brand-50'}`}>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-semibold text-brand-900">AI Grievance Assistant (suggestion)</h3>
        <span className={`rounded px-2 py-0.5 text-xs font-medium ${s.isFallback ? 'bg-amber-200 text-amber-900' : 'bg-brand-600 text-white'}`}>
          {s.isFallback ? 'Rule-based fallback (AI unavailable)' : `AI model: ${s.provider}`}
        </span>
      </div>
      <dl className="grid gap-1 text-sm sm:grid-cols-3">
        <div><dt className="muted">Suggested department</dt><dd className="font-medium">{s.department}</dd></div>
        <div><dt className="muted">Suggested category</dt><dd className="font-medium">{s.category}</dd></div>
        <div><dt className="muted">Suggested priority</dt><dd className="font-medium">{label(s.priority)}</dd></div>
      </dl>
      <p className="mt-2 text-sm"><span className="muted">Summary for CMO: </span>{s.summary}</p>
      {s.reasoning && <p className="muted mt-1">{s.reasoning}</p>}
      {s.possibleDuplicate && <p className="mt-2 rounded bg-white p-2 text-sm text-amber-800">A similar recent complaint exists in this district. It will be flagged for human review (you can still submit).</p>}
      <p className="muted mt-2 text-xs">{s.notice}</p>
      {onApply && <button type="button" onClick={onApply} className="btn-outline mt-3">Use suggested category</button>}
    </div>
  );
}
