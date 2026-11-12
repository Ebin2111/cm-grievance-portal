# 06. Setup and Testing

## Prerequisites
Node.js 20+, PostgreSQL 14+ (local, Docker, or Neon/Supabase).

## Backend
```bash
cd backend
cp .env.example .env        # edit DATABASE_URL, JWT_SECRET, AI_* values
npm install
npm run db:reset            # drops + creates tables and loads fictional seed data
npm run dev                 # http://localhost:5000  (GET /health)
```
## Frontend
```bash
cd frontend
cp .env.example .env.local  # NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
npm install
npm run dev                 # http://localhost:3000
```
## Docker (optional)
`docker compose up --build` starts Postgres, the API (auto-migrates; seed with `docker compose exec backend npm run db:seed`) and the web app.

## Environment variables
| Variable | Where | Description |
|---|---|---|
| `DATABASE_URL` | backend | Postgres connection string |
| `DATABASE_SSL` | backend | `true` for hosted Postgres requiring SSL |
| `JWT_SECRET` | backend | >= 16 chars; required to be non-default in production |
| `JWT_EXPIRES_IN` | backend | e.g. `8h` |
| `CLIENT_URL` | backend | Allowed CORS origin(s), comma-separated |
| `AI_PROVIDER`, `AI_API_KEY`, `AI_MODEL`, `AI_TIMEOUT_MS` | backend | LLM config; `none` forces the labelled fallback |
| `UPLOAD_DIR`, `MAX_UPLOAD_MB` | backend | Upload location and size cap |
| `NEXT_PUBLIC_API_URL` | frontend | API base URL |

## Demo accounts (fictional; password `Demo@12345`)
`citizen@demo.test`, `asha@demo.test`, `cmo@demo.test`, `officer.pwd@demo.test` (also `officer.hlt|edu|wrd|trn|agr|hom|rev@demo.test`).

## Automated tests
```bash
cd backend && npm test      # Node's built-in test runner, no DB needed
```
18 tests cover: workflow transition rules, role guard, request validation, AI parsing/allow-list/fallback behaviour, duplicate similarity.

## Manual end-to-end test cases
| # | Case | Expected |
|---|---|---|
| 1 | Register a citizen with a bad mobile / short password | 400 with field errors |
| 2 | Login with wrong password | 401 "Invalid email or password" |
| 3 | Submit a grievance with a PDF | Reference ID `CMK-2026-xxxxxx`; status Submitted; history has 1 row |
| 4 | Upload a `.exe` or file > 5 MB | Rejected |
| 5 | Track by reference ID without login | Limited fields; no internal notes |
| 6 | Citizen opens another citizen's grievance | 403 |
| 7 | Citizen calls `/cmo/stats` | 403 |
| 8 | CMO forwards to PWD | Status In Progress; assignment active; 3 history rows |
| 9 | Officer from another department opens it | 403 |
| 10 | Officer submits report without saving one | 400 |
| 11 | Officer saves + submits report | Status Under Review |
| 12 | CMO approves | Resolved |
| 13 | CMO tries to approve again | 400 invalid transition |
| 14 | Citizen leaves feedback, then reopens | Feedback saved; status Reopened |
| 15 | AI with no key | Card shows "Rule-based fallback (AI unavailable)" |
| 16 | CMO filters by district/status/overdue | List and counts update |

## Deployment checklist
1. Create Neon/Supabase DB; run `npm run db:reset` once with its `DATABASE_URL` (`DATABASE_SSL=true`).
2. Deploy `backend/` on Render (build `npm install`, start `node src/server.js`) with env vars. Add a persistent disk for `uploads/` if you need files to survive restarts.
3. Deploy `frontend/` on Vercel with `NEXT_PUBLIC_API_URL`.
4. Set backend `CLIENT_URL` to the Vercel URL. Open the live link and run cases 3, 8, 11, 12.
