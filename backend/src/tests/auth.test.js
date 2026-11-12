const test = require('node:test');
const assert = require('node:assert/strict');
const { requireRole } = require('../middleware/roles');
const { validate, schemas } = require('../middleware/validate');

const run = (mw, req) => new Promise((resolve) => mw(req, {}, (err) => resolve(err)));

test('requireRole rejects a missing user with 401', async () => {
  const err = await run(requireRole('CMO_ADMIN'), {});
  assert.equal(err.statusCode, 401);
});
test('requireRole rejects the wrong role with 403', async () => {
  const err = await run(requireRole('CMO_ADMIN'), { user: { role: 'CITIZEN' } });
  assert.equal(err.statusCode, 403);
});
test('requireRole allows a permitted role', async () => {
  assert.equal(await run(requireRole('CITIZEN', 'CMO_ADMIN'), { user: { role: 'CMO_ADMIN' } }), undefined);
});
test('register validation rejects weak password and bad mobile', async () => {
  const req = { body: { name: 'Ann', email: 'a@b.com', mobile: '123', password: 'short' } };
  const err = await run(validate(schemas.register), req);
  assert.equal(err.statusCode, 400);
  assert.ok(err.details.mobile && err.details.password);
});
test('register validation normalises email and accepts valid input', async () => {
  const req = { body: { name: 'Ann Citizen', email: ' ANN@Example.com ', mobile: '9876543210', password: 'longenough1' } };
  assert.equal(await run(validate(schemas.register), req), undefined);
  assert.equal(req.body.email, 'ann@example.com');
});
test('grievance validation rejects unknown district', async () => {
  const req = { body: { district: 'Atlantis', category: 'Other', subject: 'Valid subject', description: 'A sufficiently long description here' } };
  assert.equal((await run(validate(schemas.createGrievance), req)).statusCode, 400);
});
