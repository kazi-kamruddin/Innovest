const test = require("node:test");
const assert = require("node:assert/strict");
const bcrypt = require("bcrypt");

process.env.SECRET = "test-secret-with-at-least-thirty-two-characters";

const db = {
  execute: async () => { throw new Error("Unexpected query"); },
  getConnection: async () => { throw new Error("Unexpected connection"); },
};
const dbPath = require.resolve("../config/database");
require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true, exports: db };

const { createAccessToken, verifyAccessToken } = require("../utils/authTokens");
const { loginUser, signUpUser, resetPassword, verifyEmail, logoutUser } = require("../controllers/userController");
const { emailReady, sendAccountEmail } = require("../utils/accountEmail");
const createRateLimit = require("../middleware/rateLimit");

const response = () => ({
  statusCode: 200,
  headers: {},
  status(code) { this.statusCode = code; return this; },
  set(name, value) { this.headers[name] = value; return this; },
  json(body) { this.body = body; return this; },
});

test("unverified accounts cannot sign in", async () => {
  const password = await bcrypt.hash("a-long-account-password", 4);
  db.execute = async () => [[{
    id: 7, name: "Founder", email: "founder@example.com", password,
    state_user_id: 7, email_verified_at: null, token_version: 0,
  }]];
  const res = response();
  await loginUser({ body: { email: "founder@example.com", password: "a-long-account-password" } }, res);
  assert.equal(res.statusCode, 403);
  assert.equal(res.body.code, "EMAIL_UNVERIFIED");
  assert.equal(res.body.token, undefined);
});

test("signup rejects short passwords before opening a database connection", async () => {
  db.getConnection = async () => { throw new Error("Database should not be called"); };
  const res = response();
  await signUpUser({ body: { name: "Founder", email: "founder@example.com", password: "short" } }, res);
  assert.equal(res.statusCode, 400);
});

test("password reset revokes older JWTs", async () => {
  const oldToken = createAccessToken(7, 0);
  const queries = [];
  const connection = {
    beginTransaction: async () => {},
    commit: async () => {},
    rollback: async () => {},
    release: () => {},
    execute: async (sql, params) => {
      queries.push({ sql, params });
      if (sql.includes("FROM auth_action_tokens")) return [[{ id: 3, user_id: 7 }]];
      return [{}];
    },
  };
  db.getConnection = async () => connection;
  const res = response();
  await resetPassword({ body: { token: "a".repeat(64), password: "a-new-long-password" } }, res);
  assert.equal(res.statusCode, 200);
  assert.ok(queries.some(({ sql }) => sql.includes("token_version = token_version + 1")));
  assert.ok(queries.some(({ sql }) => sql.includes('DELETE FROM auth_google_identities')));

  db.execute = async () => [[{ token_version: 1 }]];
  await assert.rejects(verifyAccessToken(oldToken), /Revoked token/);
  const newToken = createAccessToken(7, 1);
  assert.equal(await verifyAccessToken(newToken), 7);
});

test("verification links are consumed after use", async () => {
  let available = true;
  const connection = {
    beginTransaction: async () => {},
    commit: async () => {},
    rollback: async () => {},
    release: () => {},
    execute: async (sql) => {
      if (sql.includes("FROM auth_action_tokens")) return [available ? [{ id: 4, user_id: 7 }] : []];
      if (sql.includes("SET consumed_at")) available = false;
      return [{}];
    },
  };
  db.getConnection = async () => connection;
  const first = response();
  const second = response();
  await verifyEmail({ body: { token: "b".repeat(64) } }, first);
  await verifyEmail({ body: { token: "b".repeat(64) } }, second);
  assert.equal(first.statusCode, 200);
  assert.equal(second.statusCode, 400);
});

test("logout revokes the presented access token", async () => {
  const token = createAccessToken(7);
  let revokedHash;
  db.execute = async (sql, params) => {
    if (sql.includes("INSERT IGNORE INTO auth_revoked_tokens")) {
      revokedHash = params[0];
      return [{}];
    }
    return [[{ token_version: 0, revoked: revokedHash === params[0] ? 1 : 0 }]];
  };
  assert.equal(await verifyAccessToken(token), 7);
  const res = response();
  await logoutUser({ authToken: token }, res);
  assert.equal(res.statusCode, 200);
  await assert.rejects(verifyAccessToken(token), /Revoked token/);
});

test("rate limiting returns HTTP 429 and retry timing", () => {
  const limit = createRateLimit({ windowMs: 60000, max: 1, key: (req) => req.ip });
  const req = { ip: "127.0.0.1" };
  let passed = 0;
  limit(req, response(), () => { passed += 1; });
  const res = response();
  limit(req, res, () => { passed += 1; });
  assert.equal(passed, 1);
  assert.equal(res.statusCode, 429);
  assert.ok(Number(res.headers["Retry-After"]) > 0);
});

test("account email uses the HTTPS provider with a link to the public site", async () => {
  const keys = ["ACCOUNT_EMAIL_ENABLED", "BREVO_API_KEY", "AUTH_EMAIL_FROM", "FRONTEND_URL"];
  const previous = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  const originalFetch = global.fetch;
  try {
    process.env.ACCOUNT_EMAIL_ENABLED = "true";
    process.env.BREVO_API_KEY = "test-key";
    process.env.AUTH_EMAIL_FROM = "sender@example.com";
    process.env.FRONTEND_URL = "https://innovest-site.vercel.app";
    let request;
    global.fetch = async (url, options) => {
      request = { url, options };
      return { ok: true };
    };
    assert.equal(emailReady(), true);
    await sendAccountEmail({ to: "founder@example.com", subject: "Verify", path: "/verify-email", token: "secret-token" });
    assert.equal(request.url, "https://api.brevo.com/v3/smtp/email");
    const body = JSON.parse(request.options.body);
    assert.equal(body.sender.email, "sender@example.com");
    assert.deepEqual(body.to, [{ email: "founder@example.com" }]);
    assert.match(body.textContent, /https:\/\/innovest-site\.vercel\.app\/verify-email#token=secret-token/);
  } finally {
    global.fetch = originalFetch;
    for (const key of keys) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
  }
});
