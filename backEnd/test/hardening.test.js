const test = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");

process.env.SECRET = "test-secret-with-at-least-thirty-two-characters";

const db = {
  execute: async () => { throw new Error("Unexpected query"); },
  getConnection: async () => { throw new Error("Unexpected connection"); },
};
const dbPath = require.resolve("../config/database");
require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true, exports: db };

const { verifyAccessToken } = require("../utils/authTokens");
const { parsePagination, MAX_OFFSET } = require("../utils/pagination");
const { getAllPitches } = require("../controllers/pitchController");
const { getAllInvestorRequests } = require("../controllers/investorRequestController");
const { startConversation, getMessages } = require("../controllers/messageController");

const response = () => ({
  statusCode: 200,
  headers: {},
  status(code) { this.statusCode = code; return this; },
  set(name, value) { this.headers[name] = value; return this; },
  json(body) { this.body = body; return this; },
});

test("verifyAccessToken rejects token signed with an unauthorized algorithm", async () => {
  // Sign a token with 'none' or different alg
  const payload = { id: 7, version: 0 };
  // jsonwebtoken allows none when secret is empty string, or we test verification failure
  const tamperedToken = jwt.sign(payload, process.env.SECRET, { algorithm: "HS384" });
  await assert.rejects(
    verifyAccessToken(tamperedToken),
    /invalid algorithm/i
  );
});

test("parsePagination sanitizes bounds and blocks malformed or overflowing values", () => {
  assert.deepEqual(parsePagination(undefined, { defaultLimit: 50, maxLimit: 100 }), { page: 1, limit: 50, offset: 0 });
  assert.deepEqual(parsePagination({ page: "2", limit: "15" }, { defaultLimit: 50, maxLimit: 100 }), { page: 2, limit: 15, offset: 15 });
  assert.deepEqual(parsePagination({ page: "0", limit: "9999", offset: "0" }, { defaultLimit: 50, maxLimit: 100 }), { page: 1, limit: 100, offset: 0 });
  assert.deepEqual(parsePagination({ limit: "15abc", page: "2e10", offset: "-5" }, { defaultLimit: 50, maxLimit: 100 }), { page: 1, limit: 50, offset: 0 });
  assert.deepEqual(parsePagination({ limit: "999999999999999999999", offset: "999999999" }, { defaultLimit: 50, maxLimit: 100 }), { page: 1, limit: 50, offset: MAX_OFFSET });

  const nullProto = Object.create(null);
  assert.deepEqual(parsePagination({ limit: nullProto, page: ["2", "3"], offset: { a: 1 } }), { page: 1, limit: 50, offset: 0 });
});

test("getAllPitches respects page and limit bounds and keeps filters parameterized without LIMIT placeholders", async () => {
  let executedSql = "";
  let executedParams = [];
  db.execute = async (sql, params) => {
    executedSql = sql;
    executedParams = params;
    return [[{ id: 1, title: "Test Pitch" }]];
  };

  const res = response();
  await getAllPitches({ query: { page: "2", limit: "15", industry: "Fin_Tech" } }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.headers["X-Page"], "2");
  assert.equal(res.headers["X-Limit"], "15");
  assert.match(executedSql, /LIMIT 15 OFFSET 15$/);
  assert.doesNotMatch(executedSql, /LIMIT \?/i);
  assert.deepEqual(executedParams, ["%Fin\\_Tech%"]);
});

test("getAllInvestorRequests sets bounded pagination headers and inlines safe integer bounds", async () => {
  let executedSql = "";
  let executedParams = [];
  db.execute = async (sql, params) => {
    executedSql = sql;
    executedParams = params;
    return [[{ id: 10, title: "Seed Request" }]];
  };

  const res = response();
  await getAllInvestorRequests({ query: { page: "1", limit: "25" } }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.headers["X-Page"], "1");
  assert.equal(res.headers["X-Limit"], "25");
  assert.match(executedSql, /LIMIT 25 OFFSET 0$/);
  assert.doesNotMatch(executedSql, /LIMIT \?/i);
  assert.equal(executedParams, undefined);
});

test("startConversation enforces canonical user order to prevent dual-knock race conditions", async () => {
  let insertedOrder = [];
  db.execute = async (sql, params) => {
    if (sql.includes("SELECT id FROM users")) return [[{ id: 3 }]];
    if (sql.includes("SELECT * FROM conversations")) return [[]];
    if (sql.includes("INSERT INTO conversations")) {
      insertedOrder = params.slice(0, 2);
      return [{ insertId: 99 }];
    }
    return [[]];
  };

  const res = response();
  // user 10 initiates knock to user 3 (10 > 3)
  await startConversation({ user: { id: 10 }, body: { targetUserId: 3 } }, res);

  assert.equal(res.statusCode, 201);
  // Canonical order: LEAST(10, 3) = 3, GREATEST(10, 3) = 10
  assert.deepEqual(insertedOrder, [3, 10]);
});

test("getMessages enforces bounded message retrieval with validated integer LIMIT and OFFSET", async () => {
  let executedSql = "";
  let executedParams = [];
  db.execute = async (sql, params) => {
    if (sql.includes("SELECT * FROM conversations")) {
      return [[{ id: 50, user_one_id: 3, user_two_id: 10 }]];
    }
    if (sql.includes("FROM messages")) {
      executedSql = sql;
      executedParams = params;
      return [[{ id: 1, body: "Hello" }]];
    }
    return [[]];
  };

  const res = response();
  await getMessages({ user: { id: 3 }, params: { id: "50" }, query: { limit: "30", offset: "10" } }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.headers["X-Limit"], "30");
  assert.match(executedSql, /LIMIT 30 OFFSET 10$/);
  assert.doesNotMatch(executedSql, /LIMIT \?/i);
  assert.deepEqual(executedParams, ["50"]);
});
