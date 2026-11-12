-- CM Kerala Grievance Portal (recruitment prototype) - PostgreSQL schema
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('CITIZEN', 'CMO_ADMIN', 'OFFICER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE grievance_status AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'REOPENED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE priority_level AS ENUM ('LOW', 'MEDIUM', 'HIGH');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 1. departments
CREATE TABLE IF NOT EXISTS departments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        VARCHAR(10) UNIQUE NOT NULL,
  name        VARCHAR(120) UNIQUE NOT NULL,
  description TEXT NOT NULL
);

-- 2. users (citizens, CMO administrators, department officers)
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(80) NOT NULL,
  email         VARCHAR(160) UNIQUE NOT NULL,
  mobile        VARCHAR(15) NOT NULL,
  password_hash TEXT NOT NULL,
  role          user_role NOT NULL DEFAULT 'CITIZEN',
  department_id UUID REFERENCES departments(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT officer_has_department CHECK (role <> 'OFFICER' OR department_id IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 3. grievances
CREATE TABLE IF NOT EXISTS grievances (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_id            VARCHAR(20) UNIQUE NOT NULL,
  citizen_id              UUID NOT NULL REFERENCES users(id),
  district                VARCHAR(40) NOT NULL,
  category                VARCHAR(60) NOT NULL,
  subject                 VARCHAR(150) NOT NULL,
  description             TEXT NOT NULL,
  priority                priority_level NOT NULL DEFAULT 'MEDIUM',
  status                  grievance_status NOT NULL DEFAULT 'SUBMITTED',
  due_date                TIMESTAMPTZ NOT NULL,
  is_escalated            BOOLEAN NOT NULL DEFAULT FALSE,
  cmo_remarks             TEXT,
  ai_summary              TEXT,
  ai_suggested_department VARCHAR(120),
  ai_suggested_category   VARCHAR(60),
  ai_suggested_priority   priority_level,
  ai_is_fallback          BOOLEAN NOT NULL DEFAULT FALSE,
  possible_duplicate_of   UUID REFERENCES grievances(id),
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_gr_status   ON grievances(status);
CREATE INDEX IF NOT EXISTS idx_gr_district ON grievances(district);
CREATE INDEX IF NOT EXISTS idx_gr_category ON grievances(category);
CREATE INDEX IF NOT EXISTS idx_gr_citizen  ON grievances(citizen_id);

-- 4. grievance_history (every status change: who, when, why)
CREATE TABLE IF NOT EXISTS grievance_history (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grievance_id UUID NOT NULL REFERENCES grievances(id) ON DELETE CASCADE,
  from_status  grievance_status,
  to_status    grievance_status NOT NULL,
  remarks      TEXT,
  changed_by   UUID NOT NULL REFERENCES users(id),
  changed_at   TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX IF NOT EXISTS idx_hist_gr ON grievance_history(grievance_id);

-- 5. department_assignments
CREATE TABLE IF NOT EXISTS department_assignments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grievance_id        UUID NOT NULL REFERENCES grievances(id) ON DELETE CASCADE,
  department_id       UUID NOT NULL REFERENCES departments(id),
  officer_id          UUID REFERENCES users(id),
  assigned_by         UUID NOT NULL REFERENCES users(id),
  action_taken_report TEXT,
  assigned_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at        TIMESTAMPTZ,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE INDEX IF NOT EXISTS idx_asg_dept ON department_assignments(department_id) WHERE is_active;
CREATE INDEX IF NOT EXISTS idx_asg_gr   ON department_assignments(grievance_id);

-- 6. attachments (files on disk, metadata here)
CREATE TABLE IF NOT EXISTS attachments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grievance_id UUID NOT NULL REFERENCES grievances(id) ON DELETE CASCADE,
  file_name    VARCHAR(200) NOT NULL,
  stored_name  VARCHAR(100) NOT NULL,
  mime_type    VARCHAR(80) NOT NULL,
  size_bytes   INTEGER NOT NULL,
  uploaded_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_att_gr ON attachments(grievance_id);

-- 7. citizen_feedback
CREATE TABLE IF NOT EXISTS citizen_feedback (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grievance_id UUID UNIQUE NOT NULL REFERENCES grievances(id) ON DELETE CASCADE,
  citizen_id   UUID NOT NULL REFERENCES users(id),
  rating       SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment      TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. contact_enquiries
CREATE TABLE IF NOT EXISTS contact_enquiries (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(80) NOT NULL,
  email      VARCHAR(160) NOT NULL,
  subject    VARCHAR(150) NOT NULL,
  message    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. ai_analyses (audit log of every AI suggestion so humans can review it)
CREATE TABLE IF NOT EXISTS ai_analyses (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grievance_id         UUID REFERENCES grievances(id) ON DELETE CASCADE,
  provider             VARCHAR(80) NOT NULL,
  is_fallback          BOOLEAN NOT NULL,
  suggested_department VARCHAR(120),
  suggested_category   VARCHAR(60),
  suggested_priority   priority_level,
  summary              TEXT,
  reasoning            TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ai_gr ON ai_analyses(grievance_id);
