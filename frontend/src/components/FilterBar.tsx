'use client';
import { label } from './StatusBadge';

export interface Filters { district: string; category: string; priority: string; status: string; overdue: string }
export const EMPTY_FILTERS: Filters = { district: '', category: '', priority: '', status: '', overdue: '' };

const STATUSES = ['SUBMITTED', 'UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'REOPENED'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];

export function FilterBar({ value, onChange, districts, categories }: { value: Filters; onChange: (f: Filters) => void; districts: string[]; categories: string[] }) {
  const set = (k: keyof Filters) => (e: React.ChangeEvent<HTMLSelectElement>) => onChange({ ...value, [k]: e.target.value });
  const Select = ({ k, name, options }: { k: keyof Filters; name: string; options: string[] }) => (
    <select className="input" value={value[k]} onChange={set(k)} aria-label={name}>
      <option value="">All {name}</option>
      {options.map((o) => <option key={o} value={o}>{k === 'status' || k === 'priority' ? label(o) : o}</option>)}
    </select>
  );
  return (
    <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
      <Select k="district" name="districts" options={districts} />
      <Select k="category" name="categories" options={categories} />
      <Select k="priority" name="priorities" options={PRIORITIES} />
      <Select k="status" name="statuses" options={STATUSES} />
      <select className="input" value={value.overdue} onChange={set('overdue')} aria-label="Overdue">
        <option value="">Overdue: any</option><option value="true">Overdue only</option>
      </select>
      <button className="btn-outline" onClick={() => onChange(EMPTY_FILTERS)}>Clear filters</button>
    </div>
  );
}
