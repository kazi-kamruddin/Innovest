const test = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcrypt');

process.env.SECRET = 'test-secret-with-at-least-thirty-two-characters';
process.env.GOOGLE_CLIENT_ID = 'test-client.apps.googleusercontent.com';

const db = { getConnection: async () => { throw new Error('Unexpected connection'); } };
const dbPath = require.resolve('../config/database');
require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true, exports: db };
const googleIdentity = require('../utils/googleIdentity');
const { googleSignIn } = require('../controllers/googleAuthController');

const credential = 'x'.repeat(150);
const payload = { sub: 'google-sub-123', email: 'founder@example.com', email_verified: true, name: 'Founder' };
const response = () => ({
  statusCode: 200,
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; },
});

function connectionFor(execute) {
  return {
    beginTransaction: async () => {},
    commit: async () => {},
    rollback: async () => {},
    release: () => {},
    execute,
  };
}

test('Google ID tokens are verified for the configured web client', async () => {
  const { OAuth2Client } = require('google-auth-library');
  const original = OAuth2Client.prototype.verifyIdToken;
  try {
    let options;
    OAuth2Client.prototype.verifyIdToken = async (value) => {
      options = value;
      return { getPayload: () => payload };
    };
    const actual = await googleIdentity.verifyGoogleIdToken(credential);
    assert.deepEqual(actual, payload);
    assert.deepEqual(options, { idToken: credential, audience: process.env.GOOGLE_CLIENT_ID });
  } finally {
    OAuth2Client.prototype.verifyIdToken = original;
  }
});

test('unverified Google email is rejected before database access', async () => {
  googleIdentity.verifyGoogleIdToken = async () => ({ ...payload, email_verified: false });
  const res = response();
  await googleSignIn({ body: { credential } }, res);
  assert.equal(res.statusCode, 401);
});

test('new Google user gets a verified account and linked stable ID', async () => {
  googleIdentity.verifyGoogleIdToken = async () => payload;
  const queries = [];
  db.getConnection = async () => connectionFor(async (sql, params) => {
    queries.push({ sql, params });
    if (sql.includes('WHERE google_sub = ?')) return [[]];
    if (sql.includes('FROM users WHERE email = ?')) return [[]];
    if (sql.includes('INSERT INTO users')) return [{ insertId: 7 }];
    if (sql.includes('SELECT u.id')) return [[{ id: 7, name: 'Founder', email: payload.email, token_version: 0 }]];
    return [{}];
  });
  const res = response();
  await googleSignIn({ body: { credential } }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.user.email, payload.email);
  assert.ok(res.body.token);
  assert.ok(queries.some(({ sql }) => sql.includes('auth_account_state') && sql.includes('email_verified_at')));
  assert.ok(queries.some(({ sql, params }) => sql.includes('INSERT INTO auth_google_identities') && params[0] === payload.sub));
  const password = queries.find(({ sql }) => sql.includes('INSERT INTO users')).params[2];
  assert.ok(password.startsWith('$2'));
});

test('existing email needs its password before Google is linked', async () => {
  googleIdentity.verifyGoogleIdToken = async () => payload;
  const passwordHash = await bcrypt.hash('existing-long-password', 4);
  const queries = [];
  db.getConnection = async () => connectionFor(async (sql, params) => {
    queries.push({ sql, params });
    if (sql.includes('WHERE google_sub = ?')) return [[]];
    if (sql.includes('FROM users WHERE email = ?')) return [[{ id: 7, name: 'Founder', email: payload.email, password: passwordHash }]];
    if (sql.includes('WHERE user_id = ? FOR UPDATE')) return [[]];
    if (sql.includes('SELECT u.id')) return [[{ id: 7, name: 'Founder', email: payload.email, token_version: 0 }]];
    return [{}];
  });

  const needsLink = response();
  await googleSignIn({ body: { credential } }, needsLink);
  assert.equal(needsLink.statusCode, 409);
  assert.equal(needsLink.body.code, 'LINK_REQUIRED');
  assert.equal(queries.some(({ sql }) => sql.includes('INSERT INTO auth_google_identities')), false);

  const wrongPassword = response();
  await googleSignIn({ body: { credential, linkPassword: 'wrong' } }, wrongPassword);
  assert.equal(wrongPassword.statusCode, 401);

  const linked = response();
  await googleSignIn({ body: { credential, linkPassword: 'existing-long-password' } }, linked);
  assert.equal(linked.statusCode, 200);
  assert.ok(queries.some(({ sql }) => sql.includes('INSERT INTO auth_google_identities')));
});

test('returning Google user signs in by sub without checking a password or email match', async () => {
  googleIdentity.verifyGoogleIdToken = async () => ({ ...payload, email: 'changed@example.com' });
  const queries = [];
  db.getConnection = async () => connectionFor(async (sql) => {
    queries.push(sql);
    if (sql.includes('WHERE google_sub = ?')) return [[{ user_id: 7 }]];
    if (sql.includes('SELECT u.id')) return [[{ id: 7, name: 'Founder', email: payload.email, token_version: 2 }]];
    throw new Error('Unexpected query');
  });
  const res = response();
  await googleSignIn({ body: { credential } }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.user.id, 7);
  assert.equal(queries.length, 2);
});
