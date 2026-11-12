# CM Grievance Portal (Recruitment Prototype)

A working prototype of a Chief Minister's public grievance redressal portal, built for the WhiteMatrix AI Full Stack Engineer machine test.

> **Disclaimer:** recruitment prototype only. Not affiliated with or endorsed by the Government of Kerala or the Chief Minister's Office. All data is fictional; do not submit real grievances.

- **Hosted app:** `<add your Vercel URL here>`
- **API:** `<add your Render URL here>/health`
- **Demo video:** `<add link>`

## Stack
Next.js 14 (React, TypeScript, Tailwind, Recharts) · Node.js + Express · PostgreSQL (`pg`) · JWT + role-based access · Gemini / Claude LLM API with a labelled rule-based fallback.

## Workflow
Citizen submits → reference ID → CMO reviews → forwards to department → officer investigates → action-taken report → CMO reviews → citizen sees update → **Resolved** or **Reopened**. Every change is stored with timestamp and responsible user.

## Demo logins (test accounts, password `Demo@12345`)
| Role | Email |
|---|---|
| Citizen | `citizen@demo.test` (also `asha@demo.test`) |
| CMO administrator | `cmo@demo.test` |
| Department officer (PWD) | `officer.pwd@demo.test` |
| Other officers | `officer.hlt`, `.edu`, `.wrd`, `.trn`, `.agr`, `.hom`, `.rev` `@demo.test` |

## Quick start
```bash
# 1. Backend
cd backend && cp .env.example .env     # set DATABASE_URL, JWT_SECRET, optional AI_API_KEY
npm install && npm run db:reset && npm run dev     # http://localhost:5000

# 2. Frontend (new terminal)
cd frontend && cp .env.example .env.local
npm install && npm run dev                          # http://localhost:3000

# Tests
cd backend && npm test
```
No AI key? Set `AI_PROVIDER=none`: the app still works and clearly labels suggestions as **"Rule-based fallback (AI unavailable)"**.

## Project structure
```
cm-grievance-portal/
├── README.md  .env.example  .gitignore  docker-compose.yml
├── DOCUMENTATION/   01..07 *.md  +  diagrams/ (architecture, ER; Mermaid)
├── backend/
│   ├── package.json  .env.example  Dockerfile  uploads/
│   └── src/
│       ├── server.js  app.js
│       ├── config/       env.js  db.js  constants.js
│       ├── db/           schema.sql  seed.sql  migrate.js
│       ├── middleware/   auth  roles  upload  validate  rateLimit  errorHandler
│       ├── routes/       auth  grievance  cmo  officer  department  contact  ai
│       ├── controllers/  one file per route group
│       ├── services/     workflow  referenceId  ai  aiFallback  duplicate
│       └── tests/        auth  workflow  ai
└── frontend/
    └── src/
        ├── app/          public pages, login, register, track, citizen/, cmo/, officer/
        ├── components/   Navbar, StatCard, StatusBadge, Timeline, AiSuggestionCard, GrievanceTable, FilterBar, Charts
        ├── lib/          api.ts  auth.tsx
        └── types/        index.ts
```

## Documentation
See [`DOCUMENTATION/`](DOCUMENTATION): overview, architecture, database design, API, AI integration, setup and testing, user guide. Diagrams are Mermaid in `DOCUMENTATION/diagrams/` (export PNGs at mermaid.live if required).

## Security highlights
bcrypt hashing · JWT with expiry · role middleware **and** ownership checks · Zod validation on every input · parameterised SQL · helmet, CORS allow-list, rate limits (login and AI) · upload allow-list (JPG/PNG/PDF, 5 MB, random stored names) · public tracker returns limited fields · no secrets in Git.

## Tools and third-party services used
- AI coding assistant: Claude (code and documentation drafting; reviewed and tested by the author)
- LLM API at runtime: Google Gemini or Anthropic Claude (optional, configurable)
- Open source: Express, pg, Zod, bcryptjs, jsonwebtoken, Multer, Helmet, express-rate-limit, Next.js, React, Tailwind CSS, Recharts
- Hosting: Vercel, Render, Neon (or equivalents)

## Known limitations
Uploads use local disk (use a persistent volume or object storage in production) · no email/SMS notifications · duplicate detection is lexical · English only.
