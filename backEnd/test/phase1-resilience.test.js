const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

process.env.SECRET = 'phase1-test-secret-with-at-least-thirty-two-characters';

const db = {
  execute: async () => { throw new Error('Unexpected execute'); },
  query: async () => { throw new Error('Unexpected query'); },
  getConnection: async () => { throw new Error('Unexpected getConnection'); },
};
const dbPath = require.resolve('../config/database');
require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true, exports: db };

const { buildPoolConfig } = require('../config/poolConfig');
const {
  MIGRATION_FILES,
  REQUIRED_TABLES,
  splitSqlStatements,
  loadMigrationPlan,
  applyMigrations,
} = require('../scripts/migrate-all');
const { findOrCreateConversation } = require('../utils/conversations');
const { startConversation } = require('../controllers/messageController');
const { pruneExpiredTokens, pruneExpiredTokensBestEffort } = require('../utils/authTokens');

const response = () => ({
  statusCode: 200,
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; },
});

test('buildPoolConfig enables system-CA TLS when DB_SSL_ENABLED=true and CA files are absent', () => {
  const cfg = buildPoolConfig(
    {
      DB_HOST: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
      DB_PORT: '4000',
      DB_USER: 'prefix.root',
      DB_PASS: 'pw',
      DB_NAME: 'innovest',
      DB_SSL_ENABLED: 'true',
      DB_SSL_CA_PATH: './certs/missing-in-docker.pem',
    },
    {
      rootDir: 'e:\\fake-root',
      fsImpl: { existsSync: () => false, readFileSync: () => { throw new Error('Should not read'); } },
    }
  );

  assert.equal(cfg.port, 4000);
  assert.deepEqual(cfg.ssl, { minVersion: 'TLSv1.2', rejectUnauthorized: true });
});

test('buildPoolConfig prefers inline DB_SSL_CA and expands escaped newlines', () => {
  const cfg = buildPoolConfig(
    {
      DB_HOST: 'aiven.example',
      DB_PORT: '16502',
      DB_USER: 'avnadmin',
      DB_PASS: 'pw',
      DB_NAME: 'defaultdb',
      DB_SSL_CA: 'LINE1\\nLINE2',
      DB_SSL_ENABLED: 'true',
    },
    {
      fsImpl: { existsSync: () => true, readFileSync: () => 'FILE_CA' },
    }
  );

  assert.equal(cfg.ssl.ca, 'LINE1\nLINE2');
  assert.equal(cfg.ssl.minVersion, 'TLSv1.2');
  assert.equal(cfg.ssl.rejectUnauthorized, true);
});

test('buildPoolConfig reads existing DB_SSL_CA_PATH file and omits ssl when disabled locally', () => {
  const withFile = buildPoolConfig(
    {
      DB_HOST: 'aiven.example',
      DB_PORT: '16502',
      DB_USER: 'avnadmin',
      DB_PASS: 'pw',
      DB_NAME: 'defaultdb',
      DB_SSL_CA_PATH: './certs/ca.pem',
    },
    {
      rootDir: path.resolve(__dirname, '..'),
      fsImpl: { existsSync: () => true, readFileSync: () => 'FILE_PEM' },
    }
  );
  assert.equal(withFile.ssl.ca, 'FILE_PEM');

  const localPlain = buildPoolConfig(
    {
      DB_HOST: '127.0.0.1',
      DB_PORT: '3306',
      DB_USER: 'root',
      DB_PASS: '',
      DB_NAME: 'innovest',
      DB_SSL_ENABLED: 'false',
    },
    {
      fsImpl: { existsSync: () => false },
    }
  );
  assert.equal('ssl' in localPlain, false);
});

test('migrate-all plan covers 000 through 004 cleanly and rejects destructive statements', async () => {
  assert.deepEqual(MIGRATION_FILES, [
    '000_baseline_schema.sql',
    '002_account_security.sql',
    '003_responses_notifications.sql',
    '004_google_identity.sql',
  ]);
  assert.equal(MIGRATION_FILES.includes('001_upgrade_2025_dump.sql'), false);

  const plan = loadMigrationPlan();
  assert.equal(plan.length, 4);
  const allStatements = plan.flatMap((item) => item.statements);
  assert.equal(allStatements.length, REQUIRED_TABLES.length);
  for (const table of REQUIRED_TABLES) {
    assert.ok(
      allStatements.some((sql) => new RegExp(`CREATE TABLE IF NOT EXISTS \`?${table}\`?\\s*\\(`, 'i').test(sql)),
      `Missing CREATE TABLE statement for ${table}`
    );
  }

  assert.throws(() => splitSqlStatements('DROP TABLE users;'), /CREATE TABLE IF NOT EXISTS/);
  assert.throws(() => splitSqlStatements(''), /no executable SQL/);

  const executed = [];
  const fakeDb = {
    query: async (sql) => {
      executed.push(sql);
      if (sql === 'SELECT DATABASE() AS name') return [[{ name: 'innovest' }]];
      return [[{ 1: 1 }]];
    },
  };
  const summary = await applyMigrations({
    db: fakeDb,
    env: { DB_HOST: 'tidb.example', DB_USER: 'root', DB_NAME: 'innovest' },
  });
  assert.equal(summary.dryRun, false);
  assert.equal(summary.tablesVerified, REQUIRED_TABLES.length);
  assert.equal(executed.length, 1 + allStatements.length + REQUIRED_TABLES.length);

  await assert.rejects(
    applyMigrations({
      db: { query: async () => [[{ name: 'wrong_db' }]] },
      env: { DB_HOST: 'tidb.example', DB_USER: 'root', DB_NAME: 'innovest' },
    }),
    /does not match DB_NAME/
  );
});

test('startConversation and findOrCreateConversation recover cleanly from ER_DUP_ENTRY races', async () => {
  let lookups = 0;
  db.execute = async (sql) => {
    if (sql.includes('SELECT id FROM users')) return [[{ id: 3 }]];
    if (sql.includes('SELECT * FROM conversations')) {
      lookups += 1;
      return lookups === 1 ? [[]] : [[{ id: 42, user_one_id: 3, user_two_id: 10 }]];
    }
    if (sql.includes('INSERT INTO conversations')) {
      const dup = new Error("Duplicate entry '3-10'");
      dup.code = 'ER_DUP_ENTRY';
      throw dup;
    }
    throw new Error(`Unexpected query: ${sql}`);
  };

  let emitted = 0;
  const io = { to: () => ({ emit: () => { emitted += 1; } }) };
  const res = response();
  await startConversation({ user: { id: 10 }, body: { targetUserId: 3 }, app: { get: () => io } }, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { id: 42, user_one_id: 3, user_two_id: 10 });
  assert.equal(emitted, 0);

  lookups = 0;
  const socketResult = await findOrCreateConversation(db, 10, 3);
  assert.deepEqual(socketResult, {
    conversation: { id: 42, user_one_id: 3, user_two_id: 10 },
    created: false,
  });
});

test('startConversation still returns 500 on unexpected non-duplicate SQL errors', async (t) => {
  t.mock.method(console, 'error', () => {});
  db.execute = async (sql) => {
    if (sql.includes('SELECT id FROM users')) return [[{ id: 3 }]];
    if (sql.includes('SELECT * FROM conversations')) return [[]];
    const failure = new Error('Connection reset');
    failure.code = 'ECONNRESET';
    throw failure;
  };
  const res = response();
  await startConversation({ user: { id: 10 }, body: { targetUserId: 3 } }, res);
  assert.equal(res.statusCode, 500);
});

test('pruneExpiredTokens cleans expired revoked/action tokens and swallows failures safely in best-effort mode', async (t) => {
  const sqlCalls = [];
  const executor = {
    execute: async (sql) => {
      sqlCalls.push(sql);
      return [{ affectedRows: sql.includes('auth_revoked_tokens') ? 4 : 9 }];
    },
  };
  const counts = await pruneExpiredTokens(executor);
  assert.deepEqual(counts, { revokedDeleted: 4, actionDeleted: 9 });
  assert.match(sqlCalls[0], /DELETE FROM auth_revoked_tokens WHERE expires_at <= UTC_TIMESTAMP\(6\)/);
  assert.match(sqlCalls[1], /DELETE FROM auth_action_tokens WHERE expires_at <= UTC_TIMESTAMP\(6\)/);

  t.mock.method(console, 'error', () => {});
  const bestEffortCounts = await pruneExpiredTokensBestEffort({
    execute: async () => { throw new Error('Pool unavailable'); },
  });
  assert.deepEqual(bestEffortCounts, { revokedDeleted: 0, actionDeleted: 0 });
});

test('smoke check retries transient cold-start responses and fails fast on 404 or mismatched body', async () => {
  const { checkWithRetry } = await import('../scripts/smoke.mjs');

  let calls = 0;
  const body = await checkWithRetry(
    'https://api.example/ready',
    '"status":"ready"',
    {
      retries: 3,
      delayMs: 0,
      timeoutMs: 1000,
      fetchImpl: async () => {
        calls += 1;
        if (calls < 3) {
          return { ok: false, status: calls === 1 ? 502 : 503, text: async () => 'Booting' };
        }
        return { ok: true, status: 200, text: async () => '{"status":"ready"}' };
      },
    }
  );
  assert.equal(calls, 3);
  assert.equal(body, '{"status":"ready"}');

  await assert.rejects(
    checkWithRetry('https://api.example/missing', '"status":"ok"', {
      retries: 3,
      delayMs: 0,
      fetchImpl: async () => ({ ok: false, status: 404, text: async () => 'Not Found' }),
    }),
    /HTTP 404/
  );

  await assert.rejects(
    checkWithRetry('https://api.example/bad', '"status":"ready"', {
      retries: 2,
      delayMs: 0,
      fetchImpl: async () => ({ ok: true, status: 200, text: async () => '{"status":"wrong"}' }),
    }),
    /did not contain the expected response/
  );
});
