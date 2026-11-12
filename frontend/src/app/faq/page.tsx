const FAQS = [
  ['Who can submit a grievance?', 'Any registered citizen. Register with your name, email, mobile number and a password. (This prototype accepts fictional data only.)'],
  ['What happens after I submit?', 'You receive a unique reference ID. The CMO reviews it, forwards it to the relevant department, and you can follow every step.'],
  ['How do I track my grievance?', 'Use "Track Grievance" and enter your reference ID (for example CMK-2026-000123). You can also see all your grievances on your dashboard.'],
  ['What is the AI assistant?', 'It reads your description and suggests a category, department, priority and a short summary. These are only suggestions; you and the CMO can change them and people make every decision.'],
  ['Can I attach a document?', 'Yes, one or more JPG, PNG or PDF files up to 5 MB each.'],
  ['What if my issue is not resolved?', 'After a grievance is marked Resolved you can give feedback or reopen it with a reason.'],
  ['Is this an official government portal?', 'No. It is a recruitment prototype and is not affiliated with the Government of Kerala or the Chief Minister\'s Office.'],
];
export default function FAQ() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="h1 mb-4">Frequently asked questions</h1>
      <div className="space-y-3">
        {FAQS.map(([q, a]) => (
          <details key={q} className="card group">
            <summary className="cursor-pointer font-medium text-brand-800">{q}</summary>
            <p className="mt-2 text-sm text-gray-700">{a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
