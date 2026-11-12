export type Role = 'CITIZEN' | 'CMO_ADMIN' | 'OFFICER';
export type Status = 'SUBMITTED' | 'UNDER_REVIEW' | 'IN_PROGRESS' | 'RESOLVED' | 'REOPENED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface User { id: string; name: string; email: string; mobile: string; role: Role; departmentId: string | null }
export interface Department { id: string; code: string; name: string; description: string }

export interface GrievanceRow {
  id: string; reference_id: string; district: string; category: string; subject: string;
  priority: Priority; status: Status; due_date: string; created_at: string; updated_at: string;
  is_escalated?: boolean; ai_is_fallback?: boolean; possible_duplicate?: boolean; overdue?: boolean; report_submitted?: boolean;
}
export interface HistoryItem {
  from_status: Status | null; to_status: Status; remarks: string | null; changed_at: string;
  changed_by_name?: string; changed_by_role?: Role;
}
export interface Assignment {
  id: string; department_id: string; department_name: string; officer_name: string | null;
  action_taken_report: string | null; assigned_at: string; submitted_at: string | null; is_active: boolean;
}
export interface Attachment { id: string; file_name: string; mime_type: string; size_bytes: number }
export interface GrievanceDetail extends GrievanceRow {
  description: string; cmo_remarks: string | null; citizen_name: string; citizen_email: string; citizen_mobile: string;
  ai_summary: string | null; ai_suggested_department: string | null; ai_suggested_category: string | null;
  ai_suggested_priority: Priority | null; possible_duplicate_of: string | null;
  history: HistoryItem[]; assignments: Assignment[]; attachments: Attachment[];
  feedback: { rating: number; comment: string | null } | null;
}
export interface AiSuggestion {
  department: string; category: string; priority: Priority; summary: string; reasoning: string;
  isFallback: boolean; provider: string; possibleDuplicate: boolean; notice: string;
}
export interface CmoStats {
  totals: { total: number; resolved: number; pending: number; overdue: number };
  byStatus: { name: string; value: number }[]; byDistrict: { name: string; value: number }[];
  byPriority: { name: string; value: number }[]; byDepartment: { name: string; value: number }[];
}
