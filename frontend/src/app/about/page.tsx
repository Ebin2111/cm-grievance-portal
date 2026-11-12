export default function About() {
  const blocks = [
    ['Purpose', 'To give citizens one simple, transparent channel to raise public grievances with the Chief Minister\'s Office and follow them to resolution.'],
    ['Vision', 'A responsive administration where every grievance is heard, routed to the right department and closed with accountability.'],
    ['Mission', 'Review every grievance promptly, forward it to the responsible department, monitor action and communicate outcomes to the citizen.'],
  ];
  return (
    <div className="space-y-6">
      <h1 className="h1">About this initiative</h1>
      <div className="grid gap-4 md:grid-cols-3">
        {blocks.map(([t, d]) => <div key={t} className="card"><h2 className="font-semibold text-brand-800">{t}</h2><p className="mt-2 text-sm text-gray-700">{d}</p></div>)}
      </div>
      <div className="card">
        <h2 className="font-semibold text-brand-800">Objectives</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
          <li>Make grievance submission easy, with optional supporting documents.</li>
          <li>Use AI to suggest category, department and priority, always reviewable by a human.</li>
          <li>Track every status change with a timestamp and the responsible user.</li>
          <li>Let citizens give feedback or reopen a grievance if it is not resolved.</li>
          <li>Give the CMO live statistics by district and department.</li>
        </ul>
      </div>
      <p className="muted">This site is a recruitment prototype and is not an official government service.</p>
    </div>
  );
}
