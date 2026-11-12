/* Usage: node src/db/migrate.js [--reset] [--seed] */
const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--reset')) {
    console.log('Dropping existing objects...');
    await pool.query(`
      DROP TABLE IF EXISTS ai_analyses, contact_enquiries, citizen_feedback, attachments, department_assignments,
        grievance_history, grievances, users, departments CASCADE;
      DROP TYPE IF EXISTS user_role, grievance_status, priority_level CASCADE;`);
  }
  console.log('Applying schema.sql ...');
  await pool.query(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));
  if (args.includes('--seed')) {
    console.log('Applying seed.sql (fictional demo data) ...');
    await pool.query(fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8'));
  }
  console.log('Database ready.');
}

main().catch((e) => { console.error(e); process.exitCode = 1; }).finally(() => pool.end());
