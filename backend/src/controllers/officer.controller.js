const { query } = require('../config/db');
const { ApiError, asyncHandler, ok } = require('../middleware/errorHandler');
const wf = require('../services/workflow.service');

exports.list = asyncHandler(async (req, res) => {
  if (!req.user.departmentId) throw ApiError.forbidden('Officer is not linked to a department');
  const { rows } = await query(
    `SELECT g.id, g.reference_id, g.district, g.category, g.subject, g.priority, g.status, g.due_date, g.updated_at,
            (a.submitted_at IS NOT NULL) AS report_submitted
     FROM grievances g JOIN department_assignments a ON a.grievance_id = g.id AND a.is_active
     WHERE a.department_id = $1 ORDER BY g.updated_at DESC`, [req.user.departmentId]);
  ok(res, rows);
});
exports.progress = asyncHandler(async (req, res) => ok(res, await wf.officerProgress(req.params.id, req.user, req.body.remarks), 'Progress updated'));
exports.saveReport = asyncHandler(async (req, res) => ok(res, await wf.saveActionReport(req.params.id, req.user, req.body.report), 'Report saved'));
exports.submit = asyncHandler(async (req, res) => ok(res, await wf.submitReport(req.params.id, req.user), 'Submitted to CMO for review'));
