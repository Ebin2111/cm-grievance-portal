const fs = require('fs');
const path = require('path');
const { query, withTransaction } = require('../config/db');
const { SLA_DAYS } = require('../config/constants');
const { ApiError, asyncHandler, ok } = require('../middleware/errorHandler');
const { UPLOAD_ROOT } = require('../middleware/upload');
const { generateReferenceId } = require('../services/referenceId');
const { analyzeGrievance } = require('../services/ai.service');
const { findPossibleDuplicate } = require('../services/duplicate.service');
const { changeStatus } = require('../services/workflow.service');

const hidden = (remarks) => (remarks && /^\[INTERNAL\]/.test(remarks) ? null : remarks);

/** Ownership / scope rules live here: citizen = own, officer = own department, CMO = all. */
async function loadForUser(id, user) {
  const g = (await query(
    `SELECT g.*, u.name AS citizen_name, u.email AS citizen_email, u.mobile AS citizen_mobile
     FROM grievances g JOIN users u ON u.id = g.citizen_id WHERE g.id = $1`, [id])).rows[0];
  if (!g) throw ApiError.notFound('Grievance not found');
  if (user.role === 'CITIZEN' && g.citizen_id !== user.id) throw ApiError.forbidden();
  const assignments = (await query(
    `SELECT a.*, d.name AS department_name, o.name AS officer_name FROM department_assignments a
     JOIN departments d ON d.id = a.department_id LEFT JOIN users o ON o.id = a.officer_id
     WHERE a.grievance_id = $1 ORDER BY a.assigned_at DESC`, [id])).rows;
  if (user.role === 'OFFICER' && !assignments.some((a) => a.is_active && a.department_id === user.departmentId)) throw ApiError.forbidden();
  return { g, assignments };
}

exports.create = asyncHandler(async (req, res) => {
  const { district, category, subject, description } = req.body;
  // Server re-runs the AI so stored AI fields can't be tampered with by the client.
  const ai = await analyzeGrievance(description);
  const dup = await findPossibleDuplicate(district, category, description);
  const files = req.files || [];

  let created;
  for (let attempt = 0; attempt < 5 && !created; attempt++) {
    try {
      created = await withTransaction(async (client) => {
        const due = new Date(Date.now() + SLA_DAYS[ai.priority] * 86_400_000);
        const g = (await client.query(
          `INSERT INTO grievances (reference_id, citizen_id, district, category, subject, description, priority, due_date,
             ai_summary, ai_suggested_department, ai_suggested_category, ai_suggested_priority, ai_is_fallback, possible_duplicate_of)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$7,$12,$13) RETURNING id, reference_id, status`,
          [generateReferenceId(), req.user.id, district, category, subject, description, ai.priority, due,
           ai.summary, ai.department, ai.category, ai.isFallback, dup ? dup.id : null])).rows[0];
        await client.query(
          `INSERT INTO grievance_history (grievance_id, from_status, to_status, remarks, changed_by)
           VALUES ($1, NULL, 'SUBMITTED', 'Grievance submitted by citizen', $2)`, [g.id, req.user.id]);
        await client.query(
          `INSERT INTO ai_analyses (grievance_id, provider, is_fallback, suggested_department, suggested_category, suggested_priority, summary, reasoning)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
          [g.id, ai.provider, ai.isFallback, ai.department, ai.category, ai.priority, ai.summary, ai.reasoning]);
        for (const f of files) {
          await client.query(
            'INSERT INTO attachments (grievance_id, file_name, stored_name, mime_type, size_bytes) VALUES ($1,$2,$3,$4,$5)',
            [g.id, f.originalname.slice(0, 200), f.filename, f.mimetype, f.size]);
        }
        return g;
      });
    } catch (e) {
      if (e.code !== '23505') { files.forEach((f) => fs.unlink(f.path, () => {})); throw e; } // retry only on reference-id collision
    }
  }
  if (!created) throw new Error('Could not allocate a reference id');
  ok(res, { id: created.id, referenceId: created.reference_id, status: created.status }, 'Grievance submitted', 201);
});

exports.mine = asyncHandler(async (req, res) => {
  const { rows } = await query(
    `SELECT id, reference_id, district, category, subject, priority, status, due_date, created_at, updated_at
     FROM grievances WHERE citizen_id = $1 ORDER BY created_at DESC`, [req.user.id]);
  const resolved = rows.filter((r) => r.status === 'RESOLVED').length;
  ok(res, { grievances: rows, counts: { total: rows.length, resolved, pending: rows.length - resolved } });
});

exports.detail = asyncHandler(async (req, res) => {
  const { g, assignments } = await loadForUser(req.params.id, req.user);
  const history = (await query(
    `SELECT h.from_status, h.to_status, h.remarks, h.changed_at, u.name AS changed_by_name, u.role AS changed_by_role
     FROM grievance_history h JOIN users u ON u.id = h.changed_by WHERE h.grievance_id = $1 ORDER BY h.changed_at ASC`, [g.id])).rows;
  const attachments = (await query('SELECT id, file_name, mime_type, size_bytes FROM attachments WHERE grievance_id = $1', [g.id])).rows;
  const feedback = (await query('SELECT rating, comment, created_at FROM citizen_feedback WHERE grievance_id = $1', [g.id])).rows[0] || null;
  const isCitizen = req.user.role === 'CITIZEN';
  ok(res, {
    ...g,
    cmo_remarks: isCitizen ? null : g.cmo_remarks,
    possible_duplicate_of: isCitizen ? null : g.possible_duplicate_of,
    history: isCitizen ? history.map((h) => ({ ...h, remarks: hidden(h.remarks) })) : history,
    assignments: assignments.map((a) => ({ ...a, action_taken_report: isCitizen && g.status !== 'RESOLVED' ? null : a.action_taken_report })),
    attachments, feedback,
  });
});

/** Public tracking: limited fields, internal notes stripped. */
exports.track = asyncHandler(async (req, res) => {
  const g = (await query(
    `SELECT g.id, g.reference_id, g.district, g.category, g.subject, g.status, g.created_at, g.updated_at,
       (SELECT d.name FROM department_assignments a JOIN departments d ON d.id = a.department_id
        WHERE a.grievance_id = g.id AND a.is_active LIMIT 1) AS assigned_department
     FROM grievances g WHERE g.reference_id = $1`, [req.params.referenceId.toUpperCase()])).rows[0];
  if (!g) throw ApiError.notFound('No grievance found with that reference number');
  const history = (await query(
    'SELECT from_status, to_status, remarks, changed_at FROM grievance_history WHERE grievance_id = $1 ORDER BY changed_at', [g.id])).rows;
  const { id, ...pub } = g;
  ok(res, { ...pub, history: history.map((h) => ({ ...h, remarks: hidden(h.remarks) })) });
});

exports.feedback = asyncHandler(async (req, res) => {
  const g = (await query('SELECT citizen_id, status FROM grievances WHERE id = $1', [req.params.id])).rows[0];
  if (!g || g.citizen_id !== req.user.id) throw ApiError.notFound('Grievance not found');
  if (g.status !== 'RESOLVED') throw ApiError.badRequest('Feedback can only be given after resolution');
  const { rows } = await query(
    `INSERT INTO citizen_feedback (grievance_id, citizen_id, rating, comment) VALUES ($1,$2,$3,$4)
     ON CONFLICT (grievance_id) DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment RETURNING rating, comment`,
    [req.params.id, req.user.id, req.body.rating, req.body.comment || null]);
  ok(res, rows[0], 'Thank you for your feedback', 201);
});

exports.reopen = asyncHandler(async (req, res) => {
  const g = (await query('SELECT citizen_id FROM grievances WHERE id = $1', [req.params.id])).rows[0];
  if (!g || g.citizen_id !== req.user.id) throw ApiError.notFound('Grievance not found');
  const result = await withTransaction((c) => changeStatus(c, req.params.id, 'REOPENED', req.user, `Reopened by citizen: ${req.body.reason}`));
  ok(res, result, 'Grievance reopened');
});

/** Authorised download: same access rules as viewing the grievance. */
exports.attachment = asyncHandler(async (req, res) => {
  const a = (await query('SELECT * FROM attachments WHERE id = $1', [req.params.id])).rows[0];
  if (!a) throw ApiError.notFound('File not found');
  await loadForUser(a.grievance_id, req.user); // throws 403 if not allowed
  const full = path.join(UPLOAD_ROOT, path.basename(a.stored_name));
  if (!fs.existsSync(full)) throw ApiError.notFound('File is no longer available on the server');
  res.setHeader('Content-Type', a.mime_type);
  res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(a.file_name)}"`);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  fs.createReadStream(full).pipe(res);
});
