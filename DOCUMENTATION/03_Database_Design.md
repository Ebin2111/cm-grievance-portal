# 03. Database Design

PostgreSQL. Source of truth: `backend/src/db/schema.sql`. ER diagram: `diagrams/er_diagram.md`.

Enums: `user_role (CITIZEN, CMO_ADMIN, OFFICER)`, `grievance_status (SUBMITTED, UNDER_REVIEW, IN_PROGRESS, RESOLVED, REOPENED)`, `priority_level (LOW, MEDIUM, HIGH)`.

| # | Table | Purpose | Key columns |
|---|---|---|---|
| 1 | `departments` | Government departments | `code` (unique), `name` (unique), `description` |
| 2 | `users` | Citizens, CMO admins, officers | `email` (unique), `password_hash`, `role`, `department_id` (required for officers via CHECK) |
| 3 | `grievances` | Core record | `reference_id` (unique, `CMK-YYYY-NNNNNN`), `citizen_id`, `district`, `category`, `priority`, `status`, `due_date`, `is_escalated`, `cmo_remarks`, `ai_*` fields, `possible_duplicate_of` |
| 4 | `grievance_history` | Audit trail | `from_status`, `to_status`, `remarks`, `changed_by`, `changed_at` |
| 5 | `department_assignments` | Forwarding + action-taken report | `department_id`, `officer_id`, `assigned_by`, `action_taken_report`, `submitted_at`, `is_active` |
| 6 | `attachments` | File metadata | `file_name`, `stored_name`, `mime_type`, `size_bytes` |
| 7 | `citizen_feedback` | One feedback per grievance | `grievance_id` (unique), `rating` (1-5 CHECK), `comment` |
| 8 | `contact_enquiries` | Contact-form messages | `name`, `email`, `subject`, `message` |
| 9 | `ai_analyses` | Log of each AI suggestion | `provider`, `is_fallback`, suggested dept/category/priority, `summary`, `reasoning` |

## Relationships
- Department 1-N Users (officers); Department 1-N Assignments.
- User (citizen) 1-N Grievances; User 1-N History rows (`changed_by`).
- Grievance 1-N History, Assignments, Attachments, AI analyses; Grievance 1-0..1 Feedback; Grievance self-reference `possible_duplicate_of`.

## Design notes
- History rows use `clock_timestamp()` so several changes inside one transaction keep their order.
- Only one assignment is `is_active` per grievance; re-assigning deactivates the previous one but keeps it for audit.
- Indexes on `status`, `district`, `category`, `citizen_id`, history/attachment `grievance_id`, and active assignments by department.
- Internal CMO notes are stored in history with an `[INTERNAL]` prefix and hidden from citizens and the public tracker.
- **Seed data** (`seed.sql`) is entirely fictional: 8 departments, 1 CMO, 2 citizens, 8 officers, 10 grievances in varied states.
