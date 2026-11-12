const test = require('node:test');
const assert = require('node:assert/strict');
const { canTransition, TRANSITIONS } = require('../services/workflow.service');

test('CMO can start review of a submitted grievance', () => assert.equal(canTransition('SUBMITTED', 'UNDER_REVIEW', 'CMO_ADMIN'), true));
test('citizen cannot resolve a grievance', () => assert.equal(canTransition('UNDER_REVIEW', 'RESOLVED', 'CITIZEN'), false));
test('officer cannot resolve directly (CMO must review the report)', () => assert.equal(canTransition('IN_PROGRESS', 'RESOLVED', 'OFFICER'), false));
test('officer can submit the action-taken report back to the CMO', () => assert.equal(canTransition('IN_PROGRESS', 'UNDER_REVIEW', 'OFFICER'), true));
test('only the citizen can reopen a resolved grievance', () => {
  assert.equal(canTransition('RESOLVED', 'REOPENED', 'CITIZEN'), true);
  assert.equal(canTransition('RESOLVED', 'REOPENED', 'CMO_ADMIN'), false);
});
test('steps cannot be skipped', () => assert.equal(canTransition('SUBMITTED', 'RESOLVED', 'CMO_ADMIN'), false));
test('every transition declares at least one role', () => assert.ok(TRANSITIONS.every((t) => t.roles.length > 0)));
