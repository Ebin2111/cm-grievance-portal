import { Priority, Status } from '@/types';

const STATUS: Record<Status, string> = {
  SUBMITTED: 'bg-gray-100 text-gray-700', UNDER_REVIEW: 'bg-blue-100 text-blue-800', IN_PROGRESS: 'bg-amber-100 text-amber-800',
  RESOLVED: 'bg-green-100 text-green-800', REOPENED: 'bg-red-100 text-red-700',
};
const PRIORITY: Record<Priority, string> = { LOW: 'bg-gray-100 text-gray-700', MEDIUM: 'bg-amber-100 text-amber-800', HIGH: 'bg-red-100 text-red-700' };
export const label = (s: string) => s.replace('_', ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase());

export function StatusBadge({ status }: { status: Status }) {
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS[status]}`}>{label(status)}</span>;
}
export function PriorityBadge({ priority }: { priority: Priority }) {
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${PRIORITY[priority]}`}>{label(priority)}</span>;
}
