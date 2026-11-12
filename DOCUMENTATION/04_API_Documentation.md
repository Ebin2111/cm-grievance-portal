# 04. API Documentation

Base URL: `/api/v1`. JSON in/out (grievance creation is `multipart/form-data`).
Auth: `Authorization: Bearer <jwt>`.

Success: `{ "success": true, "data": ..., "message": "..." }`
Error: `{ "success": false, "error": { "code": "BAD_REQUEST", "message": "...", "details": { "field": ["msg"] } } }`
Codes: 400 validation / invalid transition, 401 unauthenticated, 403 forbidden, 404 not found, 409 conflict, 429 rate limited.

## Public
| Method | Path | Description |
|---|---|---|
| GET | `/departments` | List departments |
| GET | `/meta` | Districts and categories |
| GET | `/stats/public` | `{ total, resolved, in_progress, departments }` |
| POST | `/contact` | Body `{ name, email, subject, message }`; saved to DB |
| GET | `/grievances/track/:referenceId` | Limited public view: status, assigned department, history (internal notes removed) |

## Auth
| Method | Path | Body | Notes |
|---|---|---|---|
| POST | `/auth/register` | `{ name, email, mobile (10-digit), password (min 8) }` | Creates a CITIZEN, returns `{ token, user }` |
| POST | `/auth/login` | `{ email, password }` | Returns `{ token, user }` |
| POST | `/auth/logout` | none | Stateless; client discards token |
| GET | `/auth/me` | none | Current user |

```bash
curl -X POST $API/auth/login -H 'content-type: application/json' \
  -d '{"email":"citizen@demo.test","password":"Demo@12345"}'
# {"success":true,"data":{"token":"eyJ...","user":{"id":"...","role":"CITIZEN",...}},"message":"Logged in"}
```

## AI (Citizen, CMO)
| POST | `/ai/analyze` | Body `{ description (>=20 chars), district? }` |
Returns suggestions only; nothing is stored.
```json
{ "success": true, "data": {
  "department": "Public Works (PWD)", "category": "Public Infrastructure", "priority": "HIGH",
  "summary": "Dangerous potholes near the bus stand have caused accidents.",
  "reasoning": "Road safety risk.", "isFallback": false, "provider": "gemini:gemini-2.0-flash",
  "possibleDuplicate": false, "notice": "AI suggestions are advisory..." } }
```
Rate limit: 10 requests/minute.

## Citizen
| Method | Path | Description |
|---|---|---|
| POST | `/grievances` | multipart: `district, category, subject, description, attachments[]` (JPG/PNG/PDF, max 5 MB, up to 3). Returns `{ id, referenceId, status }` |
| GET | `/grievances/my` | `{ grievances: [...], counts: { total, pending, resolved } }` |
| GET | `/grievances/:id` | Detail incl. history, assignments, attachments, feedback. Scope: citizen = own, officer = own department, CMO = all |
| POST | `/grievances/:id/feedback` | `{ rating 1-5, comment? }` (only when RESOLVED) |
| POST | `/grievances/:id/reopen` | `{ reason }` (RESOLVED -> REOPENED) |
| GET | `/attachments/:id` | Authorised file download |

## CMO (role `CMO_ADMIN`)
| Method | Path | Description |
|---|---|---|
| GET | `/cmo/grievances?district=&category=&priority=&status=&overdue=true&page=&pageSize=` | Filtered, paginated list |
| GET | `/cmo/stats` | `{ totals{total,pending,resolved,overdue}, byStatus, byDistrict, byPriority, byDepartment }` |
| GET | `/cmo/officers` | Officers list for assignment |
| PATCH | `/cmo/grievances/:id` | `{ startReview?, priority?, category?, remarks? }` |
| POST | `/cmo/grievances/:id/assign` | `{ departmentId, officerId?, remarks? }` -> IN_PROGRESS |
| POST | `/cmo/grievances/:id/remarks` | `{ remarks }` internal note |
| POST | `/cmo/grievances/:id/escalate` | `{ remarks? }` sets `is_escalated`, priority HIGH |
| POST | `/cmo/grievances/:id/review-report` | `{ approve: boolean, remarks? }` -> RESOLVED or back to IN_PROGRESS |

## Officer (role `OFFICER`)
| Method | Path | Description |
|---|---|---|
| GET | `/officer/grievances` | Grievances forwarded to the officer's department |
| PATCH | `/officer/grievances/:id/status` | `{ remarks }` progress update (stays IN_PROGRESS) |
| POST | `/officer/grievances/:id/action-report` | `{ report (>=10 chars) }` |
| POST | `/officer/grievances/:id/submit` | Submit report to CMO -> UNDER_REVIEW |

## Health
`GET /health` returns `{ "status": "ok" }` (outside `/api/v1`).
