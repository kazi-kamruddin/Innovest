const fs = require('node:fs');
const path = require('node:path');
const db = require('../config/database');

async function main() {
  if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
    throw new Error('DB_HOST, DB_USER, and DB_NAME must be configured in backEnd/.env');
  }

  const file = path.join(__dirname, '..', 'database', '003_responses_notifications.sql');
  const statements = fs.readFileSync(file, 'utf8')
    .split(/;\s*(?:\r?\n|$)/)
    .map((statement) => statement.trim())
    .filter(Boolean);
  if (statements.length !== 2 || statements.some((statement) => !/^CREATE TABLE IF NOT EXISTS\s+/i.test(statement))) {
    throw new Error('Unexpected migration content; review 003_responses_notifications.sql before running it');
  }

  const [[target]] = await db.query('SELECT DATABASE() AS name');
  if (target.name !== process.env.DB_NAME) throw new Error('Connected database does not match DB_NAME');
  console.log(`Applying response/notification migration to ${target.name} on ${process.env.DB_HOST}`);

  for (const statement of statements) await db.query(statement);
  await db.query('SELECT 1 FROM pitch_response_states LIMIT 1');
  await db.query('SELECT 1 FROM user_notifications LIMIT 1');
  console.log('Migration complete: pitch_response_states and user_notifications are ready.');
}

main()
  .catch((error) => {
    console.error(`Migration failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => db.end());
