# 01. Project Overview

## Problem statement
Citizens face issues with infrastructure, healthcare, education and public services, but have no single, transparent channel to raise them with the Chief Minister's Office (CMO) and follow them to closure. This project is a **recruitment prototype** of such a portal. It is not affiliated with or endorsed by the Government of Kerala or the CMO, and uses fictional data only.

## Objectives
1. Let citizens submit grievances with optional supporting files and receive a unique reference ID.
2. Let the CMO review, prioritise, forward and monitor grievances.
3. Let department officers investigate, update progress and submit action-taken reports.
4. Keep a complete, timestamped audit trail of every status change.
5. Use an LLM to **suggest** category, department, priority and a summary, always reviewable by humans.

## Scope
**In scope:** public website, citizen portal, CMO dashboard, officer dashboard, AI assistant with labelled fallback, REST API, PostgreSQL storage, file upload, statistics charts.
**Out of scope (prototype):** real government integrations, SMS/email notifications, multilingual UI, payments, production-grade malware scanning of uploads.

## Features
| Area | Features |
|---|---|
| Public | Home, About, How It Works, Departments, Contact (saved to DB), FAQ, Track by reference ID |
| Citizen | Register/login/logout, submit grievance (district, category, subject, description, files), AI suggestions, dashboard with pending/resolved counts, history, remarks, feedback, reopen |
| CMO | Totals (total/pending/resolved/overdue), filters (district/category/priority/status/overdue), view attachments, assign/forward, internal remarks, escalate, review action-taken report, district and department charts |
| Officer | Own-department queue, view details/attachments, progress updates, action-taken report, submit to CMO |
| AI | Department + category + priority suggestion, CMO summary, duplicate flag, labelled fallback |

## Workflow
Citizen submits → reference ID → CMO reviews → forwards to department → officer investigates → action-taken report → CMO reviews → citizen sees update → **Resolved** or **Reopened**.
Statuses: `SUBMITTED, UNDER_REVIEW, IN_PROGRESS, RESOLVED, REOPENED`.

## Tools and third-party services (disclosure)
- AI coding assistant (Claude) was used to help generate and review code and documentation.
- Open-source libraries: Express, pg, Zod, bcryptjs, jsonwebtoken, Multer, Helmet, Next.js, React, Tailwind CSS, Recharts.
- LLM API: Google Gemini or Anthropic Claude (configurable; optional).
- Hosting suggestions: Vercel (frontend), Render (backend), Neon (PostgreSQL).
