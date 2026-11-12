export function StatCard({ label, value, tone = 'default' }: { label: string; value: number | string; tone?: 'default' | 'good' | 'warn' | 'bad' }) {
  const color = { default: 'text-brand-800', good: 'text-green-700', warn: 'text-amber-600', bad: 'text-red-600' }[tone];
  return (
    <div className="card text-center">
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
      <div className="muted mt-1">{label}</div>
    </div>
  );
}
