const STEPS = [
  ['1', 'Submit', 'The citizen registers, describes the issue and optionally attaches a photo or document. A unique reference ID is generated.'],
  ['2', 'CMO review', 'The Chief Minister\'s Office reviews the grievance, checks the AI-suggested category and priority, and can override them.'],
  ['3', 'Department assignment', 'The CMO forwards the grievance to the relevant department and officer.'],
  ['4', 'Action', 'The officer investigates, posts progress updates and submits an action-taken report.'],
  ['5', 'CMO verification', 'The CMO reviews the report and either approves it or sends it back for more action.'],
  ['6', 'Resolution', 'The citizen sees the outcome, can give feedback, or reopen the grievance if it is not resolved.'],
];
export default function HowItWorks() {
  return (
    <div>
      <h1 className="h1 mb-6">How it works</h1>
      <ol className="space-y-4">
        {STEPS.map(([n, t, d]) => (
          <li key={n} className="card flex gap-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-700 font-bold text-white">{n}</span>
            <div><h2 className="font-semibold text-brand-800">{t}</h2><p className="mt-1 text-sm text-gray-700">{d}</p></div>
          </li>
        ))}
      </ol>
      <p className="muted mt-4">Statuses: Submitted → Under Review → In Progress → Resolved (or Reopened).</p>
    </div>
  );
}
