# 02. System Architecture

See `diagrams/system_architecture.md` for the diagram.

## Frontend (`frontend/`)
Next.js 14 (App Router) + TypeScript + Tailwind CSS + Recharts. All pages are client components that call the REST API.
- `src/lib/api.ts`: fetch wrapper (adds `Authorization: Bearer`, normalises errors, authorised file open).
- `src/lib/auth.tsx`: `AuthProvider` (token in `localStorage`) and `useRequireRole()` route guard. The guard is a UX aid; **the API enforces authorisation**.
- `src/components/`: Navbar/Footer/PrototypeBanner, StatCard, StatusBadge, Timeline, AiSuggestionCard, GrievanceTable, FilterBar, Charts.

## Backend (`backend/`)
Node.js + Express (CommonJS). Layering: **routes → controllers → services → database**.
- `middleware/`: `auth` (JWT), `roles` (role guard), `validate` (Zod), `upload` (Multer allow-list + size cap), `rateLimit`, `errorHandler` (`ApiError`, uniform error shape).
- `services/workflow.service.js`: the single source of truth for the status transition table; every change runs in a transaction with row locking (`SELECT ... FOR UPDATE`) and writes a `grievance_history` row.
- `services/ai.service.js`, `aiFallback.js`, `duplicate.service.js`: the AI assistant (see doc 05).
- Ownership rules (citizen sees own, officer sees own department, CMO sees all) are enforced in `grievance.controller.js`.

## Database
PostgreSQL, 9 tables (see doc 03). Plain SQL schema applied by `src/db/migrate.js`.

## AI
Provider abstraction (Gemini or Anthropic via REST `fetch`) with timeout, JSON-only prompt, allow-list validation and a labelled fallback.

## Files
Uploaded with Multer to `backend/uploads` under random names; metadata in `attachments`. Download only through `GET /attachments/:id` after an access check.
> Free hosting tiers often have ephemeral disks. For production use a persistent volume or object storage (S3/Cloudinary) behind the same interface.

## Authentication & authorisation
bcrypt password hashes, JWT (8h) in the `Authorization` header, roles `CITIZEN`, `CMO_ADMIN`, `OFFICER`. Officers are tied to a department; CMO and officer accounts are created by seed (no public sign-up for those roles).

## Deployment topology
Vercel (Next.js) → Render (Express) → Neon (Postgres). Set `CLIENT_URL` on the API to the Vercel URL (CORS) and `NEXT_PUBLIC_API_URL` on the frontend to the API URL.
