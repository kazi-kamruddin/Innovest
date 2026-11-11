const test = require('node:test');
const assert = require('node:assert/strict');

const {
  INDUSTRIES,
  STAGES,
  ROLES,
  DEMO_USERS,
  DEMO_PITCHES,
  DEMO_REQUESTS,
  DEMO_RESPONSES,
  parseKeepEmails,
  validateSeedDataset,
  buildPruneQuery,
  seedDemo,
} = require('../scripts/seed-demo');

test('validateSeedDataset confirms full marketplace coverage and 6 named demo accounts', () => {
  const counts = validateSeedDataset();
  assert.deepEqual(counts, {
    users: 6,
    investorProfiles: 6,
    requestsOpen: 6,
    requestsClosed: 1,
    publicPitches: 10,
    responsePitches: 3,
    conversations: 2,
    messages: 4,
  });

  const expectedNames = [
    'Kazi Kamruddin Ahmed',
    'Hasibur Rahman Srijon',
    'Sumit Majumder',
    'Rakibul Islam',
    'Abdullah Ishtiaq',
    'Sadik Rahman',
  ];
  assert.deepEqual(DEMO_USERS.map((u) => u.name), expectedNames);

  const industries = new Set(DEMO_PITCHES.map((p) => p.industry));
  const stages = new Set(DEMO_PITCHES.map((p) => p.stage));
  const roles = new Set(DEMO_PITCHES.map((p) => p.ideal_investor_role));
  for (const item of INDUSTRIES) assert.ok(industries.has(item), `Missing industry ${item}`);
  for (const item of STAGES) assert.ok(stages.has(item), `Missing stage ${item}`);
  for (const item of ROLES) assert.ok(roles.has(item), `Missing role ${item}`);

  for (const resp of DEMO_RESPONSES) {
    const req = DEMO_REQUESTS.find((r) => r.title === resp.requestTitle);
    assert.ok(req);
    assert.notEqual(req.investorEmail, resp.founderEmail);
  }
});

test('parseKeepEmails and buildPruneQuery preserve demo and personal emails safely', () => {
  const kept = parseKeepEmails(' Founder@Example.com , , teammate@example.com, founder@example.com ');
  assert.deepEqual(kept, ['founder@example.com', 'teammate@example.com']);

  assert.throws(() => buildPruneQuery([]), /cannot be empty/);

  const prune = buildPruneQuery(['kazi@demo.innovest.local', 'founder@example.com']);
  assert.equal(prune.sql, 'DELETE FROM users WHERE LOWER(email) NOT IN (?, ?)');
  assert.deepEqual(prune.params, ['kazi@demo.innovest.local', 'founder@example.com']);
});

test('seedDemo defaults to safe dry-run without acquiring a database connection', async () => {
  let called = false;
  const result = await seedDemo({
    db: { getConnection: async () => { called = true; throw new Error('Must not connect in dry-run'); } },
    apply: false,
    pruneTestData: true,
    keepEmails: ['personal@example.com'],
  });
  assert.equal(called, false);
  assert.equal(result.dryRun, true);
  assert.equal(result.apply, false);
  assert.ok(result.preservedEmails.includes('personal@example.com'));
  assert.equal(result.counts.publicPitches, 10);
});

test('seedDemo --apply writes within a transaction, prunes test accounts, and is idempotent on repeat', async () => {
  let nextUserId = 100;
  let nextReqId = 200;
  let nextPitchId = 300;
  let nextConvoId = 400;
  const usersByEmail = new Map();
  const requests = [];
  const pitches = [];
  const convos = [];
  const messages = [];
  const events = [];

  const connection = {
    beginTransaction: async () => events.push('begin'),
    commit: async () => events.push('commit'),
    rollback: async () => events.push('rollback'),
    release: () => events.push('release'),
    execute: async (sql, params = []) => {
      if (sql.startsWith('DELETE FROM users WHERE LOWER(email) NOT IN')) {
        return [{ affectedRows: 2 }];
      }
      if (sql.startsWith('SELECT id FROM users WHERE email = ?')) {
        const id = usersByEmail.get(params[0]);
        return [id ? [{ id }] : []];
      }
      if (sql.startsWith('INSERT INTO users')) {
        nextUserId += 1;
        usersByEmail.set(params[1], nextUserId);
        return [{ insertId: nextUserId }];
      }
      if (sql.startsWith('SELECT id FROM investor_requests WHERE investorId = ? AND title = ?')) {
        const hit = requests.find((r) => r.investorId === params[0] && r.title === params[1]);
        return [hit ? [{ id: hit.id }] : []];
      }
      if (sql.startsWith('INSERT INTO investor_requests')) {
        nextReqId += 1;
        requests.push({ id: nextReqId, investorId: params[0], title: params[1] });
        return [{ insertId: nextReqId }];
      }
      if (sql.startsWith('SELECT id FROM pitches WHERE user_id = ? AND title = ? AND forRequestId IS NULL')) {
        const hit = pitches.find((p) => p.user_id === params[0] && p.title === params[1] && p.forRequestId === null);
        return [hit ? [{ id: hit.id }] : []];
      }
      if (sql.startsWith('INSERT INTO pitches') && sql.includes('NULL)')) {
        nextPitchId += 1;
        pitches.push({ id: nextPitchId, user_id: params[0], title: params[1], forRequestId: null });
        return [{ insertId: nextPitchId }];
      }
      if (sql.startsWith('SELECT id FROM pitches WHERE user_id = ? AND title = ? AND forRequestId = ?')) {
        const hit = pitches.find((p) => p.user_id === params[0] && p.title === params[1] && p.forRequestId === params[2]);
        return [hit ? [{ id: hit.id }] : []];
      }
      if (sql.startsWith('INSERT INTO pitches')) {
        nextPitchId += 1;
        pitches.push({ id: nextPitchId, user_id: params[0], title: params[1], forRequestId: params[14] });
        return [{ insertId: nextPitchId }];
      }
      if (sql.startsWith('SELECT id FROM conversations')) {
        const hit = convos.find((c) => c.u1 === params[0] && c.u2 === params[1]);
        return [hit ? [{ id: hit.id }] : []];
      }
      if (sql.startsWith('INSERT INTO conversations')) {
        nextConvoId += 1;
        convos.push({ id: nextConvoId, u1: params[0], u2: params[1] });
        return [{ insertId: nextConvoId }];
      }
      if (sql.startsWith('SELECT COUNT(*) AS count FROM messages')) {
        return [[{ count: messages.filter((m) => m.conversation_id === params[0]).length }]];
      }
      if (sql.startsWith('INSERT INTO messages')) {
        messages.push({ conversation_id: params[0], sender_id: params[1], body: params[2] });
        return [{ insertId: messages.length }];
      }
      if (sql.startsWith('SELECT id FROM user_notifications')) {
        return [[]];
      }
      return [{ insertId: 1 }];
    },
  };

  const fakeDb = { getConnection: async () => connection };
  const firstRun = await seedDemo({
    db: fakeDb,
    apply: true,
    pruneTestData: true,
    keepEmails: ['personal@example.com'],
    demoPassword: 'TestDemoPassword#2026',
  });
  assert.equal(firstRun.prunedUsers, 2);
  assert.deepEqual(events, ['begin', 'commit', 'release']);
  assert.equal(pitches.filter((p) => p.forRequestId === null).length, 10);
  assert.equal(pitches.filter((p) => p.forRequestId !== null).length, 3);
  assert.equal(messages.length, 4);

  // Repeat pass updates without creating duplicate pitches, requests, conversations, or messages.
  await seedDemo({ db: fakeDb, apply: true, demoPassword: 'TestDemoPassword#2026' });
  assert.equal(usersByEmail.size, 6);
  assert.equal(requests.length, 7);
  assert.equal(pitches.length, 13);
  assert.equal(convos.length, 2);
  assert.equal(messages.length, 4);
});

test('seedDemo rolls back and releases connection if a SQL statement throws', async () => {
  const lifecycle = [];
  const brokenDb = {
    getConnection: async () => ({
      beginTransaction: async () => lifecycle.push('begin'),
      execute: async () => { throw new Error('Simulated TiDB failure'); },
      rollback: async () => lifecycle.push('rollback'),
      release: () => lifecycle.push('release'),
    }),
  };

  await assert.rejects(
    seedDemo({ db: brokenDb, apply: true, demoPassword: 'TestDemoPassword#2026' }),
    /Simulated TiDB failure/
  );
  assert.deepEqual(lifecycle, ['begin', 'rollback', 'release']);
});
