const { query } = require('../config/db');
const { asyncHandler, ok } = require('../middleware/errorHandler');
const { DISTRICTS, CATEGORIES } = require('../config/constants');

exports.list = asyncHandler(async (_req, res) => ok(res, (await query('SELECT id, code, name, description FROM departments ORDER BY name')).rows));
exports.meta = asyncHandler(async (_req, res) => ok(res, { districts: DISTRICTS, categories: CATEGORIES }));
exports.publicStats = asyncHandler(async (_req, res) => {
  const r = (await query(`SELECT count(*)::int AS total, count(*) FILTER (WHERE status = 'RESOLVED')::int AS resolved,
    count(*) FILTER (WHERE status IN ('IN_PROGRESS','UNDER_REVIEW'))::int AS in_progress,
    (SELECT count(*)::int FROM departments) AS departments FROM grievances`)).rows[0];
  ok(res, r);
});
