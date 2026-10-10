const fs = require('node:fs');
const path = require('node:path');
const db = require('../config/database');

async function main() {
  if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
    throw new Error('DB_HOST, DB_USER, and DB_NAME must be configured in backEnd/.env');
  }
  const migration = fs.readFileSync(path.join(__dirname, '..', 'database', '004_google_identity.sql'), 'utf8').trim();
  if (!/^CREATE TABLE IF NOT EXISTS auth_google_identities\s*\(/i.test(migration)) {
    throw new Error('Unexpected Google migration content');
  }
  const [[target]] = await db.query('SELECT DATABASE() AS name');
  if (target.name !== process.env.DB_NAME) throw new Error('Connected database does not match DB_NAME');
  console.log(`Applying Google identity migration to ${target.name} on ${process.env.DB_HOST}`);
  await db.query(migration);
  await db.query('SELECT 1 FROM auth_google_identities LIMIT 1');
  console.log('Migration complete: auth_google_identities is ready.');
}

main()
  .catch((error) => {
    console.error(`Migration failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => db.end());
