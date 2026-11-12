# 05. AI Integration

## Model / API
Configurable via environment: `AI_PROVIDER=gemini|anthropic|none`, `AI_MODEL`, `AI_API_KEY`. Called server-side with `fetch` and an `AbortSignal` timeout (`AI_TIMEOUT_MS`, default 15 s). The API key never reaches the browser.

## Workflow
1. Citizen writes a description and clicks **Get AI suggestions** (`POST /ai/analyze`). Nothing is saved.
2. The server loads the department list, builds the prompt and calls the LLM.
3. The response is parsed as JSON and validated with Zod; `department` must be in the department table and `category` in the category list.
4. The UI shows an **AI suggestion card**: department, category, priority, CMO summary, reasoning, and a duplicate hint. The citizen can adopt or ignore it.
5. On submission the server **re-runs the analysis itself** (so the client cannot forge AI fields) and stores `ai_*` fields on the grievance plus a row in `ai_analyses`. The initial priority comes from the AI; the CMO can override it, and the SLA due date is recalculated.
6. The CMO sees the AI suggestion beside the grievance and decides the department and priority.

## Prompt (summary)
System prompt tells the model it only produces suggestions, must treat the complaint as data inside `<complaint>` tags (prompt-injection defence), must choose from allowed lists, defines LOW/MEDIUM/HIGH, and must return one JSON object: `{department, category, priority, summary, reasoning}`. Full text: `backend/src/services/ai.service.js`.

## Duplicate detection
`duplicate.service.js` compares the new text (Jaccard similarity of tokens) with grievances in the **same district and category in the last 60 days**. A score >= 0.45 sets `possible_duplicate_of` for human review. It never blocks submission and never reveals other citizens' reference IDs to the citizen.

## Labelled fallback
If the key is missing, the provider errors or times out, the output is not valid JSON, or the output is outside the allow-lists, the system uses `aiFallback.js`, a **keyword heuristic**. Results are marked `isFallback = true`, stored as `ai_is_fallback`, and shown in the UI as **"Rule-based fallback (AI unavailable)"**. This is documented as a limitation: the fallback is not AI.

## Safeguards
- AI **never** changes status, assigns a department or resolves anything.
- Output validated against allow-lists; invalid output discarded.
- Only the complaint text (and, for duplicates, the district) is used. No name, email or mobile is sent to the model.
- Timeouts, rate limiting (10/min), and graceful degradation.
- Every suggestion is logged in `ai_analyses` for audit.

## Limitations
- LLM output can be wrong or biased; humans must review.
- Duplicate detection is lexical (token overlap), not semantic; paraphrased duplicates may be missed.
- Language: tuned for English complaints.
- Free-tier LLM quotas may trigger the fallback.
- Tests mock the model (`src/tests/ai.test.js`); live-model behaviour depends on the provider.
