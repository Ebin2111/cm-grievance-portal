# Database ER Diagram

```mermaid
erDiagram
  DEPARTMENTS ||--o{ USERS : "employs officers"
  USERS ||--o{ GRIEVANCES : "submits (citizen)"
  GRIEVANCES ||--o{ GRIEVANCE_HISTORY : "has"
  USERS ||--o{ GRIEVANCE_HISTORY : "changed_by"
  GRIEVANCES ||--o{ DEPARTMENT_ASSIGNMENTS : "forwarded via"
  DEPARTMENTS ||--o{ DEPARTMENT_ASSIGNMENTS : "receives"
  USERS ||--o{ DEPARTMENT_ASSIGNMENTS : "officer / assigned_by"
  GRIEVANCES ||--o{ ATTACHMENTS : "has"
  GRIEVANCES ||--o| CITIZEN_FEEDBACK : "receives"
  USERS ||--o{ CITIZEN_FEEDBACK : "writes"
  GRIEVANCES ||--o{ AI_ANALYSES : "logged for"
  GRIEVANCES |o--o| GRIEVANCES : "possible_duplicate_of"

  DEPARTMENTS { uuid id PK; string code UK; string name UK; text description }
  USERS { uuid id PK; string name; string email UK; string mobile; text password_hash; enum role; uuid department_id FK }
  GRIEVANCES { uuid id PK; string reference_id UK; uuid citizen_id FK; string district; string category; string subject; text description; enum priority; enum status; timestamptz due_date; bool is_escalated; text cmo_remarks; text ai_summary; bool ai_is_fallback; uuid possible_duplicate_of FK }
  GRIEVANCE_HISTORY { uuid id PK; uuid grievance_id FK; enum from_status; enum to_status; text remarks; uuid changed_by FK; timestamptz changed_at }
  DEPARTMENT_ASSIGNMENTS { uuid id PK; uuid grievance_id FK; uuid department_id FK; uuid officer_id FK; uuid assigned_by FK; text action_taken_report; timestamptz submitted_at; bool is_active }
  ATTACHMENTS { uuid id PK; uuid grievance_id FK; string file_name; string stored_name; string mime_type; int size_bytes }
  CITIZEN_FEEDBACK { uuid id PK; uuid grievance_id FK_UK; uuid citizen_id FK; smallint rating; text comment }
  CONTACT_ENQUIRIES { uuid id PK; string name; string email; string subject; text message }
  AI_ANALYSES { uuid id PK; uuid grievance_id FK; string provider; bool is_fallback; string suggested_department; string suggested_category; enum suggested_priority; text summary; text reasoning }
```

Export a PNG via https://mermaid.live and save it as `er_diagram.png` in this folder.
