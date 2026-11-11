const fs = require('node:fs');
const path = require('node:path');

const MIGRATION_FILES = [
  '000_baseline_schema.sql',
  '002_account_security.sql',
  '003_responses_notifications.sql',
  '004_google_identity.sql',
];

const REQUIRED_TABLES = [
  'users',
  'user_info',
  'investor_info',
  'investor_requests',
  'pitches',
  'conversations',
  'messages',
  'auth_account_state',
  'auth_action_tokens',
  'auth_revoked_tokens',
  'pitch_response_states',
  'user_notifications',
  'auth_google_identities',
];

const DEFAULT_DATABASE_DIR = path.join(__dirname, '..', 'database');

function splitSqlStatements(sql) {
  const withoutLineComments = String(sql || '').replace(/^\s*--.*$/gm, '');
  const statements = withoutLineComments
    .split(/;\s*(?:\r?\n|$)/)
    .map((statement) => statement.trim())
    .filter(Boolean);

  if (!statements.length) {
    throw new Error('Migration file contained no executable SQL statements');
  }
  if (statements.some((statement) => !/^CREATE TABLE IF NOT EXISTS\s+/i.test(statement))) {
    throw new Error('Unexpected migration statement; only CREATE TABLE IF NOT EXISTS is permitted in migrate:all');
  }
  return statements;
}

function loadMigrationPlan(databaseDir = DEFAULT_DATABASE_DIR) {
  return MIGRATION_FILES.map((file) => {
    const filePath = path.join(databaseDir, file);
    const statements = splitSqlStatements(fs.readFileSync(filePath, 'utf8'));
    return { file, statements };
  });
}

async function applyMigrations({ db, env = process.env, databaseDir = DEFAULT_DATABASE_DIR, dryRun = false } = {}) {
  const plan = loadMigrationPlan(databaseDir);
  if (dryRun) {
    return { dryRun: true, plan, tablesVerified: 0 };
  }

  if (!env.DB_HOST || !env.DB_USER || !env.DB_NAME) {
    throw new Error('DB_HOST, DB_USER, and DB_NAME must be configured in backEnd/.env');
  }

  const [[target]] = await db.query('SELECT DATABASE() AS name');
  if (!target?.name || target.name !== env.DB_NAME) {
    throw new Error(`Connected database (${target?.name || 'none'}) does not match DB_NAME (${env.DB_NAME})`);
  }

  for (const { file, statements } of plan) {
    console.log(`Applying ${file} (${statements.length} statement(s)) to ${target.name} on ${env.DB_HOST}`);
    for (const statement of statements) {
      await db.query(statement);
    }
  }

  for (const table of REQUIRED_TABLES) {
    await db.query(`SELECT 1 FROM \`${table}\` LIMIT 1`);
  }

  return { dryRun: false, plan, tablesVerified: REQUIRED_TABLES.length, database: target.name };
}

async function runCli() {
  const dryRun = process.argv.includes('--dry-run');
  if (dryRun) {
    const result = await applyMigrations({ dryRun: true });
    for (const { file, statements } of result.plan) {
      console.log(`[dry-run] ${file}: ${statements.length} CREATE TABLE IF NOT EXISTS statement(s)`);
    }
    console.log(`[dry-run] Verified ${result.plan.length} migration file(s) cleanly.`);
    return;
  }

  const db = require('../config/database');
  try {
    const result = await applyMigrations({ db });
    console.log(`Migration complete: ${result.tablesVerified} tables verified ready in ${result.database}.`);
  } finally {
    await db.end();
  }
}

if (require.main === module) {
  runCli().catch((error) => {
    console.error(`Migration failed: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = {
  MIGRATION_FILES,
  REQUIRED_TABLES,
  splitSqlStatements,
  loadMigrationPlan,
  applyMigrations,
};
