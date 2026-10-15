const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { createServer } = require('node:http');

const dbPath = require.resolve('../config/database');
require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true, exports: {
  execute: async () => { throw new Error('Invalid identifiers must not reach SQL'); },
} };

test('malformed public record IDs are rejected before MySQL can coerce them', async (t) => {
  const app = express();
  app.use('/profile', require('../routes/userInfoRoutes'));
  app.use('/pitches', require('../routes/pitchRoutes'));
  app.use('/investor-info', require('../routes/investorInfoRoutes'));
  const server = createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  for (const path of ['/profile/7garbage', '/pitches/1.5', '/pitches/-1', '/investor-info/public/9007199254740992']) {
    const response = await fetch(`${base}${path}`);
    assert.equal(response.status, 400, path);
    assert.match((await response.json()).error, /Invalid/);
  }
});
