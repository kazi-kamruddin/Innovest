const test = require("node:test");
const assert = require("node:assert/strict");

const db = { execute: async () => { throw new Error("Unexpected query"); } };
const dbPath = require.resolve("../config/database");
require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true, exports: db };

const { createInvestorRequest, getPitchesForRequest, updateResponseStatus } = require("../controllers/investorRequestController");
const { listNotifications, markRead } = require('../controllers/notificationController');
const { storeInvestorInfo, getInvestorList } = require("../controllers/investorInfoController");
const { createPitch, createPitchInResponse, getAllPitches, getPitchById } = require("../controllers/pitchController");
const { startConversation, getMessages, sendMessage } = require("../controllers/messageController");
const { getUserInfo, storeUserInfo } = require("../controllers/userInfoController");

const response = () => ({
  statusCode: 200,
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; },
});

test("request creation requires an investor profile", async () => {
  const queries = [];
  db.execute = async (sql) => { queries.push(sql); return [[]]; };
  const res = response();

  await createInvestorRequest({ user: { id: 7 }, body: {
    investorId: 7, title: "Request", description: "Description", category: "Technology",
  } }, res);

  assert.equal(res.statusCode, 403);
  assert.equal(queries.length, 1);
  assert.match(queries[0], /investor_info/);
});

test("request creation preserves zero investment amounts", async () => {
  let inserted;
  db.execute = async (sql, params) => {
    if (sql.includes("SELECT user_id FROM investor_info")) return [[{ user_id: 7 }]];
    if (sql.includes("INSERT INTO investor_requests")) { inserted = params; return [{ insertId: 12 }]; }
    return [[{ id: 12 }]];
  };
  const res = response();

  await createInvestorRequest({ user: { id: 7 }, body: {
    investorId: 7, title: "Request", description: "Description", category: "Technology",
    minInvestment: 0, maxInvestment: 0,
  } }, res);

  assert.equal(res.statusCode, 201);
  assert.deepEqual(inserted.slice(-2), [0, 0]);
});

test("request creation rejects an inverted investment range before writing", async () => {
  db.execute = async () => { throw new Error("Database should not be called"); };
  const res = response();

  await createInvestorRequest({ user: { id: 7 }, body: {
    investorId: 7, title: "Request", description: "Description", category: "Technology",
    minInvestment: 200, maxInvestment: 100,
  } }, res);

  assert.equal(res.statusCode, 400);
});

test("blank investor profile amounts are stored as null", async () => {
  let inserted;
  db.execute = async (sql, params) => {
    if (sql.includes("SELECT id FROM users")) return [[{ id: 7 }]];
    if (sql.includes("SELECT id FROM investor_info")) return [[]];
    if (sql.includes("INSERT INTO investor_info")) { inserted = params; return [{}]; }
    return [[{ user_id: 7 }]];
  };
  const res = response();

  await storeInvestorInfo({ user: { id: 7 }, body: {
    user_id: 7, investment_range_min: "", investment_range_max: "",
  } }, res);

  assert.equal(res.statusCode, 201);
  assert.deepEqual(inserted.slice(2, 4), [null, null]);
});

test("pitch creation rejects negative funding before writing", async () => {
  db.execute = async () => { throw new Error("Database should not be called"); };
  const res = response();

  await createPitch({ user: { id: 7 }, body: {
    title: "Pitch", industry: "Technology", minimum_investment: -1,
  } }, res);

  assert.equal(res.statusCode, 400);
});

test("pitch creation preserves zero funding amounts", async () => {
  let inserted;
  db.execute = async (sql, params) => {
    if (sql.includes("INSERT INTO pitches")) { inserted = params; return [{ insertId: 15 }]; }
    return [[{ id: 15 }]];
  };
  const res = response();

  await createPitch({ user: { id: 7 }, body: {
    title: "Pitch", industry: "Technology", total_raising_amount: 0, minimum_investment: 0,
  } }, res);

  assert.equal(res.statusCode, 201);
  assert.deepEqual(inserted.slice(8, 10), [0, 0]);
});

test('public discovery excludes pitches submitted to investor requests', async () => {
  db.execute = async (sql) => {
    assert.match(sql, /pitches\.forRequestId IS NULL/);
    return [[{ id: 14, title: 'Public pitch' }]];
  };
  const res = response();
  await getAllPitches({ query: {} }, res);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body.map((pitch) => pitch.id), [14]);
});

test('response pitch detail is visible only to its founder and request investor', async () => {
  let investorLookups = 0;
  db.execute = async (sql) => {
    if (sql.includes('FROM pitches')) return [[{ id: 15, user_id: 7, forRequestId: 22 }]];
    if (sql.includes('FROM investor_requests')) {
      investorLookups += 1;
      return [[{ investorId: 9 }]];
    }
    throw new Error('Unexpected query');
  };
  for (const [userId, expected] of [[undefined, 404], [7, 200], [9, 200], [10, 404]]) {
    const res = response();
    await getPitchById({ params: { id: '15' }, user: userId ? { id: userId } : undefined }, res);
    assert.equal(res.statusCode, expected);
  }
  assert.equal(investorLookups, 2);
});

test('standalone pitch detail remains public', async () => {
  db.execute = async (sql) => {
    assert.match(sql, /FROM pitches/);
    return [[{ id: 16, title: 'Public pitch', user_id: 7, forRequestId: null }]];
  };
  const res = response();
  await getPitchById({ params: { id: '16' } }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.title, 'Public pitch');
});

test("conversation creation rejects the current user as recipient", async () => {
  db.execute = async () => { throw new Error("Database should not be called"); };
  const res = response();

  await startConversation({ user: { id: 7 }, body: { targetUserId: 7 } }, res);

  assert.equal(res.statusCode, 400);
});

test("non-participants cannot read or send conversation messages", async () => {
  const queries = [];
  db.execute = async (sql) => {
    queries.push(sql);
    return [[]];
  };
  const read = response();
  await getMessages({ user: { id: 99 }, params: { id: '42' } }, read);
  assert.equal(read.statusCode, 403);

  const write = response();
  await sendMessage({ user: { id: 99 }, params: { id: '42' }, body: { content: 'Not a member' } }, write);
  assert.equal(write.statusCode, 403);
  assert.equal(queries.length, 2);
  assert.ok(queries.every((sql) => sql.includes('user_one_id = ? OR user_two_id = ?')));
});

test("public profile never returns the account email", async () => {
  db.execute = async () => [[{
    user_id: 7, name: "Founder", email: "private@example.com",
    location: "Dhaka", areas_of_interest: "Technology", about: "Building a product",
  }]];
  const res = response();
  await getUserInfo({ params: { userId: "7" } }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.user.email, undefined);
  assert.equal(res.body.user.name, "Founder");
});

test("starting a new conversation tells both participants", async () => {
  db.execute = async (sql) => {
    if (sql.includes("SELECT id FROM users")) return [[{ id: 9 }]];
    if (sql.includes("SELECT * FROM conversations")) return [[]];
    if (sql.includes("INSERT INTO conversations")) return [{ insertId: 42 }];
    throw new Error("Unexpected query");
  };
  const events = [];
  const io = { to(room) { this.room = room; return this; }, emit(name, payload) { events.push({ room: this.room, name, payload }); } };
  const res = response();
  await startConversation({ user: { id: 7 }, body: { targetUserId: 9 }, app: { get: () => io } }, res);
  assert.equal(res.statusCode, 201);
  assert.deepEqual(events.map(({ room, name }) => [room, name]), [
    ["user:7", "new_conversation"], ["user:9", "new_conversation"],
  ]);
  assert.equal(events[0].payload.conversationId, 42);
});

test("REST messages reach both participants through Socket.IO", async () => {
  db.execute = async (sql) => sql.includes("SELECT * FROM conversations")
    ? [[{ user_one_id: 7, user_two_id: 9 }]]
    : [{ insertId: 22 }];
  const rooms = [];
  const emitted = [];
  const io = {
    to(room) { rooms.push(room); return this; },
    emit(event, payload) { emitted.push({ event, payload }); },
  };
  const res = response();

  await sendMessage({
    user: { id: 7 }, params: { id: "3" }, body: { content: "Hello" },
    app: { get: () => io },
  }, res);

  assert.equal(res.statusCode, 201);
  assert.deepEqual(rooms, ["user:7", "user:9", "user:9"]);
  assert.equal(emitted[0].event, "receive_message");
  assert.equal(emitted[0].payload.id, res.body.id);
  assert.equal(emitted[1].event, "notification");
});

test('oversized messages are rejected before reaching the database', async () => {
  db.execute = async () => { throw new Error('Database should not be called'); };
  const res = response();
  await sendMessage({
    user: { id: 7 }, params: { id: '3' }, body: { content: 'x'.repeat(4001) },
  }, res);
  assert.equal(res.statusCode, 400);
  assert.match(res.body.error, /4000/);
});

test('only the investor request owner can view response pitches', async () => {
  let pitchQueryRan = false;
  db.execute = async (sql) => {
    if (sql.includes('SELECT investorId')) return [[{ investorId: 9 }]];
    pitchQueryRan = true;
    return [[]];
  };
  const res = response();
  await getPitchesForRequest({ user: { id: 7 }, params: { id: '3' } }, res);
  assert.equal(res.statusCode, 403);
  assert.equal(pitchQueryRan, false);
});

test('submitting a response notifies the investor', async () => {
  const events = [];
  const transaction = [];
  let released = false;
  db.getConnection = async () => ({
    execute: (...args) => db.execute(...args),
    beginTransaction: async () => transaction.push('begin'),
    commit: async () => transaction.push('commit'),
    rollback: async () => transaction.push('rollback'),
    release: () => { released = true; transaction.push('release'); },
  });
  db.execute = async (sql) => {
    if (sql.includes('SELECT investorId, status')) return [[{ investorId: 9, status: 'open' }]];
    if (sql.includes('INSERT INTO pitches')) return [{ insertId: 21 }];
    if (sql.includes('INSERT INTO user_notifications')) {
      assert.equal(released, true, 'The notification must not compete with a held transaction connection');
      return [{ insertId: 44 }];
    }
    return [[{ id: 21 }]];
  };
  const io = { to: (room) => ({ emit: (event) => events.push({ room, event }) }) };
  const res = response();
  await createPitchInResponse({ user: { id: 7 }, params: { requestId: '3' }, body: {
    title: 'Pitch', industry: 'Technology', minimum_investment: 0, total_raising_amount: 10,
  }, app: { get: () => io } }, res);
  assert.equal(res.statusCode, 201);
  assert.deepEqual(transaction, ['begin', 'commit', 'release']);
  assert.deepEqual(events, [{ room: 'user:9', event: 'notification' }]);
});

test('a closed request rolls back without writing a response or notification', async () => {
  const calls = [];
  db.getConnection = async () => ({
    beginTransaction: async () => calls.push('begin'),
    execute: async (sql) => {
      assert.match(sql, /FOR UPDATE/);
      calls.push('check');
      return [[{ investorId: 9, status: 'closed' }]];
    },
    rollback: async () => calls.push('rollback'),
    release: () => calls.push('release'),
  });
  const res = response();
  await createPitchInResponse({ user: { id: 7 }, params: { requestId: '3' }, body: { title: 'Pitch', industry: 'Technology' } }, res);
  assert.equal(res.statusCode, 400);
  assert.deepEqual(calls, ['begin', 'check', 'rollback', 'release']);
});

test('a lost response transaction still returns an error and releases its connection', async (t) => {
  t.mock.method(console, 'error', () => {});
  let released = false;
  db.getConnection = async () => ({
    beginTransaction: async () => {},
    execute: async (sql) => {
      if (sql.startsWith('SELECT investorId')) return [[{ investorId: 9, status: 'open' }]];
      throw new Error('Connection lost during insert');
    },
    rollback: async () => { throw new Error('Connection is unavailable for rollback'); },
    release: () => { released = true; },
  });
  const res = response();
  await createPitchInResponse({ user: { id: 7 }, params: { requestId: '3' }, body: { title: 'Pitch', industry: 'Technology' } }, res);
  assert.equal(res.statusCode, 500);
  assert.equal(released, true);
});

test('invalid types and values exceeding column limits are rejected before SQL writes', async () => {
  db.execute = async () => { throw new Error('Database should not be called'); };
  for (const [handler, body] of [
    [createPitch, { title: 'Pitch', industry: 'Technology', country: {} }],
    [createPitch, { title: 'x'.repeat(256), industry: 'Technology' }],
    [createPitch, { title: 'Pitch', industry: 'Technology', total_raising_amount: 1e100 }],
    [createInvestorRequest, { investorId: 7, title: 'x'.repeat(256), description: 'Request', category: 'Technology' }],
    [storeUserInfo, { about: [] }],
    [storeUserInfo, []],
    [storeUserInfo, { about: '界'.repeat(22000) }],
    [storeInvestorInfo, { user_id: 7, preferred_industries: {} }],
  ]) {
    const res = response();
    await handler({ user: { id: 7 }, params: { userId: '7' }, body }, res);
    assert.equal(res.statusCode, 400);
  }
});

test('an empty investor directory returns an empty collection', async () => {
  db.execute = async () => [[]];
  const res = response();
  await getInvestorList({}, res);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, []);
});

test('response review queries do not disclose the founder login email', async () => {
  db.execute = async (sql) => {
    if (sql.includes('SELECT investorId')) return [[{ investorId: 9 }]];
    assert.doesNotMatch(sql, /u\.email/);
    return [[{ id: 21, name: 'Founder' }]];
  };
  const res = response();
  await getPitchesForRequest({ user: { id: 9 }, params: { id: '3' } }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body[0].name, 'Founder');
});

test('only the request owner can change response status', async () => {
  const calls = [];
  db.getConnection = async () => ({
    beginTransaction: async () => calls.push('begin'),
    execute: async () => [[{ user_id: 7, investorId: 9 }]],
    rollback: async () => calls.push('rollback'),
    release: () => calls.push('release'),
  });
  const res = response();
  await updateResponseStatus({ user: { id: 8 }, params: { id: '3', pitchId: '5' }, body: { status: 'interested' } }, res);
  assert.equal(res.statusCode, 403);
  assert.deepEqual(calls, ['begin', 'rollback', 'release']);
});

test('status update persists one notification for the entrepreneur', async () => {
  const queries = [];
  const events = [];
  db.getConnection = async () => ({
    beginTransaction: async () => {},
    execute: async (sql, params) => {
      queries.push({ sql, params });
      if (sql.includes('SELECT p.user_id')) return [[{ user_id: 7, investorId: 9 }]];
      if (sql.includes('SELECT status FROM pitch_response_states')) return [[]];
      return [{ insertId: 12 }];
    },
    commit: async () => {},
    rollback: async () => {},
    release: () => {},
  });
  const io = { to: (room) => ({ emit: (event) => events.push({ room, event }) }) };
  const res = response();
  await updateResponseStatus({ user: { id: 9 }, params: { id: '3', pitchId: '5' }, body: { status: 'interested' }, app: { get: () => io } }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.status, 'interested');
  assert.equal(queries.filter(({ sql }) => sql.includes('INSERT INTO user_notifications')).length, 1);
  assert.deepEqual(events, [{ room: 'user:7', event: 'notification' }]);
});

test('notification reads are scoped to the signed-in user', async () => {
  const calls = [];
  db.execute = async (sql, params) => {
    calls.push({ sql, params });
    if (sql.startsWith('UPDATE')) return [{ affectedRows: 0 }];
    return sql.includes('COUNT') ? [[{ unread: 1 }]] : [[{ id: 2 }]];
  };
  const listRes = response();
  await listNotifications({ user: { id: 7 } }, listRes);
  assert.equal(listRes.body.unread, 1);
  assert.deepEqual(calls[0].params, [7]);
  const readRes = response();
  await markRead({ user: { id: 7 }, params: { id: '5' } }, readRes);
  assert.equal(readRes.statusCode, 404);
  assert.deepEqual(calls[2].params, [5, 7]);
});
