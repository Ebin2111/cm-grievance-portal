const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { query } = require('../config/db');
const { ApiError, asyncHandler, ok } = require('../middleware/errorHandler');

const toPublic = (u) => ({ id: u.id, name: u.name, email: u.email, mobile: u.mobile, role: u.role, departmentId: u.department_id });
const sign = (u) => jwt.sign({ sub: u.id, role: u.role }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

exports.register = asyncHandler(async (req, res) => {
  const { name, email, mobile, password } = req.body;
  if ((await query('SELECT 1 FROM users WHERE email = $1', [email])).rowCount) throw ApiError.conflict('Email already registered');
  const hash = await bcrypt.hash(password, 10);
  const { rows } = await query(
    `INSERT INTO users (name, email, mobile, password_hash, role) VALUES ($1,$2,$3,$4,'CITIZEN') RETURNING *`,
    [name, email, mobile, hash],
  );
  ok(res, { token: sign(rows[0]), user: toPublic(rows[0]) }, 'Registered', 201);
});

exports.login = asyncHandler(async (req, res) => {
  const { rows } = await query('SELECT * FROM users WHERE email = $1', [req.body.email]);
  const u = rows[0];
  // identical message for unknown email and wrong password (no account enumeration)
  if (!u || !(await bcrypt.compare(req.body.password, u.password_hash))) throw ApiError.unauthorized('Invalid email or password');
  ok(res, { token: sign(u), user: toPublic(u) }, 'Logged in');
});

exports.me = asyncHandler(async (req, res) => {
  const { rows } = await query('SELECT * FROM users WHERE id = $1', [req.user.id]);
  ok(res, toPublic(rows[0]));
});

// JWT is stateless: the client discards the token. Endpoint kept for API completeness.
exports.logout = asyncHandler(async (_req, res) => ok(res, null, 'Logged out'));
