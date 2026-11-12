const { query, withTransaction } = require('../config/db');
const { SLA_DAYS } = require('../config/constants');
const { ApiError, asyncHandler, ok } = require('../middleware/errorHandler');
const wf = require('../services/workflow.service');

exports.list = asyncHandler(async (req, res) => {
  const { district, category, priority, status, overdue, page, pageSize } = req.query;
  const where = []; const params = [];
  const add = (sql, v) => { params.push(v); where.push(sql.replace('?', `$${params.length}`)); };
  if (district) add('district = ?', district);
  if (category) add('category = ?', category);
  if (priority) add('priority = ?', priority);
  if (status) add('status = ?', status);
  if (overdue === 'true') where.push("due_date < now() AND status <> 'RESOLVED'");
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const total = (await query(`SELECT count(*)::int AS n FROM grievances ${clause}`, params)).rows[0].n;
  const { rows } = await query(
    `SELECT id, reference_id, district, category, subject, priority, status, due_date, is_escalated, ai_is_fallback,
            (possible_duplicate_of IS NOT NULL) AS possible_duplicate, created_at, updated_at,
            (due_date < now() AND status <> 'RESOLVED') AS overdue
     FROM grievances ${clause} ORDER BY is_escalated DESC, created_at DESC LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}`, params);
  ok(res, { items: rows, total, page, pageSize });
});

exports.stats = asyncHandler(async (_req, res) => {
  const t = (await query(`SELECT count(*)::int AS total,
      count(*) FILTER (WHERE status = 'RESOLVED')::int AS resolved,
      count(*) FILTER (WHERE status <> 'RESOLVED')::int AS pending,
      count(*) FILTER (WHERE due_date < now() AND status <> 'RESOLVED')::int AS overdue FROM grievances`)).rows[0];
  const group = async (sql) => (await query(sql)).rows;
  ok(res, {
    totals: t,
    byStatus: await group('SELECT status AS name, count(*)::int AS value FROM grievances GROUP BY status ORDER BY value DESC'),
    byDistrict: await group('SELECT district AS name, count(*)::int AS value FROM grievances GROUP BY district ORDER BY value DESC'),
    byPriority: await group('SELECT priority AS name, count(*)::int AS value FROM grievances GROUP BY priority'),
    byDepartment: await group(`SELECT d.name, count(*)::int AS value FROM department_assignments a
      JOIN departments d ON d.id = a.department_id WHERE a.is_active GROUP BY d.name ORDER BY value DESC`),
  });
});

exports.officers = asyncHandler(async (_req, res) =>
  ok(res, (await query("SELECT id, name, department_id FROM users WHERE role = 'OFFICER' ORDER BY name")).rows));

exports.update = asyncHandler(async (req, res) => {
  const { priority, category, startReview, remarks } = req.body;
  await withTransaction(async (client) => {
    const g = (await client.query('SELECT created_at FROM grievances WHERE id = $1 FOR UPDATE', [req.params.id])).rows[0];
    if (!g) throw ApiError.notFound('Grievance not found');
    if (priority || category) {
      await client.query(
        `UPDATE grievances SET priority = COALESCE($2, priority), category = COALESCE($3, category),
           due_date = CASE WHEN $2::priority_level IS NULL THEN due_date ELSE created_at + ($4::text || ' days')::interval END, updated_at = now()
         WHERE id = $1`, [req.params.id, priority || null, category || null, String(SLA_DAYS[priority] || 0)]);
      await wf.logNote(client, req.params.id, req.user, `[INTERNAL] CMO updated ${[priority && `priority=${priority}`, category && `category=${category}`].filter(Boolean).join(', ')}`);
    }
    if (startReview) await wf.changeStatus(client, req.params.id, 'UNDER_REVIEW', req.user, remarks || 'CMO review started');
  });
  ok(res, null, 'Updated');
});

exports.assign = asyncHandler(async (req, res) => ok(res, await wf.assignToDepartment(req.params.id, req.user, req.body), 'Forwarded to department'));

exports.remark = asyncHandler(async (req, res) => {
  await withTransaction(async (client) => {
    const r = await client.query('UPDATE grievances SET cmo_remarks = $2, updated_at = now() WHERE id = $1', [req.params.id, req.body.remarks]);
    if (!r.rowCount) throw ApiError.notFound('Grievance not found');
    await wf.logNote(client, req.params.id, req.user, `[INTERNAL] ${req.body.remarks}`);
  });
  ok(res, null, 'Remark added');
});

exports.escalate = asyncHandler(async (req, res) => {
  await withTransaction(async (client) => {
    const g = (await client.query('SELECT status FROM grievances WHERE id = $1 FOR UPDATE', [req.params.id])).rows[0];
    if (!g) throw ApiError.notFound('Grievance not found');
    if (g.status === 'RESOLVED') throw ApiError.badRequest('Resolved grievances cannot be escalated');
    await client.query("UPDATE grievances SET is_escalated = TRUE, priority = 'HIGH', updated_at = now() WHERE id = $1", [req.params.id]);
    await wf.logNote(client, req.params.id, req.user, `[INTERNAL] [ESCALATED] ${(req.body && req.body.remarks) || 'Escalated by CMO for delay'}`);
  });
  ok(res, null, 'Escalated');
});

exports.reviewReport = asyncHandler(async (req, res) =>
  ok(res, await wf.reviewReport(req.params.id, req.user, req.body.approve, req.body.remarks), 'Report reviewed'));
