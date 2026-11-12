const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { query } = require('../config/db');
const { ApiError, asyncHandler } = require('./errorHandler');

/** Verifies the Bearer JWT and loads the current user onto req.user. */
const authenticate = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) throw ApiError.unauthorized();
  let payload;
  try {
    payload = jwt.verify(header.slice(7), env.JWT_SECRET);
  } catch {
    throw ApiError.unauthorized('Invalid or expired token');
  }
  const { rows } = await query('SELECT id, name, role, department_id FROM users WHERE id = $1', [payload.sub]);
  if (!rows[0]) throw ApiError.unauthorized('User no longer exists');
  req.user = { id: rows[0].id, name: rows[0].name, role: rows[0].role, departmentId: rows[0].department_id };
  next();
});

module.exports = { authenticate };
