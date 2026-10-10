const test = require("node:test");
const assert = require("node:assert/strict");

const db = { execute: async () => { throw new Error("Unexpected query"); } };
const dbPath = require.resolve("../config/database");
require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true, exports: db };

const { createInvestorRequest } = require("../controllers/investorRequestController");
const { storeInvestorInfo } = require("../controllers/investorInfoController");
const { createPitch } = require("../controllers/pitchController");
const { startConversation, sendMessage } = require("../controllers/messageController");

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

test("conversation creation rejects the current user as recipient", async () => {
  db.execute = async () => { throw new Error("Database should not be called"); };
  const res = response();

  await startConversation({ user: { id: 7 }, body: { targetUserId: 7 } }, res);

  assert.equal(res.statusCode, 400);
});

test("REST messages reach both participants through Socket.IO", async () => {
  db.execute = async (sql) => sql.includes("SELECT * FROM conversations")
    ? [[{ user_one_id: 7, user_two_id: 9 }]]
    : [{ insertId: 22 }];
  const rooms = [];
  let emitted;
  const io = {
    to(room) { rooms.push(room); return this; },
    emit(event, payload) { emitted = { event, payload }; },
  };
  const res = response();

  await sendMessage({
    user: { id: 7 }, params: { id: "3" }, body: { content: "Hello" },
    app: { get: () => io },
  }, res);

  assert.equal(res.statusCode, 201);
  assert.deepEqual(rooms, ["user:7", "user:9"]);
  assert.equal(emitted.event, "receive_message");
  assert.equal(emitted.payload.id, res.body.id);
});
