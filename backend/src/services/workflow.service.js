const { withTransaction } = require('../config/db');
const { ApiError } = require('../middleware/errorHandler');

/**
 * Single source of truth for the mandatory workflow:
 * Submitted -> Under Review -> In Progress -> (report) Under Review -> Resolved -> Reopened.
 */
const TRANSITIONS = [
  { from: 'SUBMITTED',    to: 'UNDER_REVIEW', roles: ['CMO_ADMIN'] }, // CMO picks up
  { from: 'UNDER_REVIEW', to: 'IN_PROGRESS',  roles: ['CMO_ADMIN'] }, // CMO forwards / returns report
  { from: 'IN_PROGRESS',  to: 'IN_PROGRESS',  roles: ['OFFICER'] },   // officer progress update
  { from: 'IN_PROGRESS',  to: 'UNDER_REVIEW', roles: ['OFFICER'] },   // officer submits action-taken report
  { from: 'UNDER_REVIEW', to: 'RESOLVED',     roles: ['CMO_ADMIN'] }, // CMO approves
  { from: 'RESOLVED',     to: 'REOPENED',     roles: ['CITIZEN'] },   // citizen reopens
  { from: 'REOPENED',     to: 'UNDER_REVIEW', roles: ['CMO_ADMIN'] }, // CMO re-reviews
];

const canTransition = (from, to, role) =>
  TRANSITIONS.some((t) => t.from === from && t.to === to && t.roles.includes(role));

/**
 * Moves a grievance to a new status inside the caller's transaction (`client`),
 * enforcing the rules above and writing a history row (who, when, why).
 */
async function changeStatus(client, grievanceId, to, actor, remarks) {
  const { rows } = await client.query('SELECT status FROM grievances WHERE id = $1 FOR UPDATE', [grievanceId]);
  if (!rows[0]) throw ApiError.notFound('Grievance not found');
  const from = rows[0].status;
  if (!canTransition(from, to, actor.role)) {
    throw ApiError.badRequest(`${actor.role} cannot move a grievance from ${from} to ${to}`);
  }
  await client.query('UPDATE grievances SET status = $2, updated_at = now() WHERE id = $1', [grievanceId, to]);
  await client.query(
    `INSERT INTO grievance_history (grievance_id, from_status, to_status, remarks, changed_by) VALUES ($1,$2,$3,$4,$5)`,
    [grievanceId, from, to, remarks || null, actor.id],
  );
  return { id: grievanceId, from, to };
}

/** Writes a non-transition note (internal remark / escalation) into the audit trail. */
async function logNote(client, grievanceId, actor, remarks) {
  await client.query(
    `INSERT INTO grievance_history (grievance_id, from_status, to_status, remarks, changed_by)
     SELECT id, status, status, $2, $3 FROM grievances WHERE id = $1`,
    [grievanceId, remarks, actor.id],
  );
}

/** CMO forwards a grievance to a department (and optionally one officer). */
const assignToDepartment = (grievanceId, actor, { departmentId, officerId, remarks }) =>
  withTransaction(async (client) => {
    const g = (await client.query('SELECT status FROM grievances WHERE id = $1 FOR UPDATE', [grievanceId])).rows[0];
    if (!g) throw ApiError.notFound('Grievance not found');
    if (!['SUBMITTED', 'UNDER_REVIEW', 'REOPENED'].includes(g.status)) {
      throw ApiError.badRequest(`Cannot assign a grievance that is ${g.status}`);
    }
    const dept = (await client.query('SELECT id, name FROM departments WHERE id = $1', [departmentId])).rows[0];
    if (!dept) throw ApiError.badRequest('Unknown department');
    if (officerId) {
      const o = (await client.query('SELECT role, department_id FROM users WHERE id = $1', [officerId])).rows[0];
      if (!o || o.role !== 'OFFICER' || o.department_id !== dept.id) throw ApiError.badRequest('Officer does not belong to that department');
    }
    if (g.status !== 'UNDER_REVIEW') await changeStatus(client, grievanceId, 'UNDER_REVIEW', actor, 'CMO review started');
    await client.query('UPDATE department_assignments SET is_active = FALSE WHERE grievance_id = $1 AND is_active', [grievanceId]);
    await client.query(
      'INSERT INTO department_assignments (grievance_id, department_id, officer_id, assigned_by) VALUES ($1,$2,$3,$4)',
      [grievanceId, dept.id, officerId || null, actor.id],
    );
    return changeStatus(client, grievanceId, 'IN_PROGRESS', actor, remarks || `Forwarded to ${dept.name}`);
  });

async function activeAssignment(client, grievanceId, actor) {
  const a = (await client.query('SELECT * FROM department_assignments WHERE grievance_id = $1 AND is_active FOR UPDATE', [grievanceId])).rows[0];
  if (!a || a.department_id !== actor.departmentId) throw ApiError.forbidden('This grievance is not assigned to your department');
  return a;
}

const officerProgress = (grievanceId, actor, remarks) =>
  withTransaction(async (client) => {
    await activeAssignment(client, grievanceId, actor);
    return changeStatus(client, grievanceId, 'IN_PROGRESS', actor, remarks);
  });

const saveActionReport = (grievanceId, actor, report) =>
  withTransaction(async (client) => {
    const a = await activeAssignment(client, grievanceId, actor);
    await client.query('UPDATE department_assignments SET action_taken_report = $2, officer_id = COALESCE(officer_id, $3) WHERE id = $1', [a.id, report, actor.id]);
    return { id: grievanceId };
  });

const submitReport = (grievanceId, actor) =>
  withTransaction(async (client) => {
    const a = await activeAssignment(client, grievanceId, actor);
    if (!a.action_taken_report) throw ApiError.badRequest('Save an action-taken report before submitting');
    await client.query('UPDATE department_assignments SET submitted_at = now() WHERE id = $1', [a.id]);
    return changeStatus(client, grievanceId, 'UNDER_REVIEW', actor, 'Action-taken report submitted to CMO');
  });

/** CMO approves (-> RESOLVED) or returns (-> IN_PROGRESS) the department's report. */
const reviewReport = (grievanceId, actor, approve, remarks) =>
  withTransaction(async (client) => {
    const a = (await client.query('SELECT submitted_at FROM department_assignments WHERE grievance_id = $1 AND is_active', [grievanceId])).rows[0];
    if (!a || !a.submitted_at) throw ApiError.badRequest('No submitted action-taken report to review');
    return changeStatus(client, grievanceId, approve ? 'RESOLVED' : 'IN_PROGRESS', actor,
      remarks || (approve ? 'Report approved; grievance resolved' : 'Report returned to department for further action'));
  });

module.exports = { TRANSITIONS, canTransition, changeStatus, logNote, assignToDepartment, officerProgress, saveActionReport, submitReport, reviewReport };
