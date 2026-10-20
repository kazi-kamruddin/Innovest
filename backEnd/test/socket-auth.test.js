const test = require('node:test');
const assert = require('node:assert/strict');
const { createServer } = require('node:http');
const { once } = require('node:events');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const { io: connect } = require('socket.io-client');

process.env.SECRET = 'socket-test-secret-with-at-least-thirty-two-characters';
let revoked = false;
const dbPath = require.resolve('../config/database');
require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true, exports: {
  execute: async () => [[{ token_version: 0, revoked: Number(revoked) }]],
} };
const { authenticateSocket, protectSocketSession } = require('../middleware/socketAuth');

async function setup(t, expiresIn) {
  revoked = false;
  const http = createServer();
  const io = new Server(http);
  io.use(authenticateSocket);
  let received = 0;
  io.on('connection', (socket) => {
    protectSocketSession(socket);
    socket.on('send_message', () => { received += 1; socket.emit('saved'); });
  });
  await new Promise((resolve) => http.listen(0, '127.0.0.1', resolve));
  const token = jwt.sign({ id: 7, version: 0 }, process.env.SECRET, { expiresIn });
  const client = connect(`http://127.0.0.1:${http.address().port}`, { auth: { token }, reconnection: false });
  t.after(async () => { client.disconnect(); await new Promise((resolve) => io.close(resolve)); });
  await once(client, 'connect');
  return { client, received: () => received };
}

test('a connected socket is disconnected when its access token expires', { timeout: 6000 }, async (t) => {
  const { client, received } = await setup(t, 2);
  const saved = once(client, 'saved');
  client.emit('send_message', { content: 'Before expiry' });
  await saved;
  assert.equal(received(), 1);
  const [reason] = await once(client, 'disconnect');
  assert.equal(reason, 'io server disconnect');
});

test('revoking a token blocks packets on an already connected socket', { timeout: 6000 }, async (t) => {
  const { client, received } = await setup(t, 60);
  revoked = true;
  const disconnected = once(client, 'disconnect');
  client.emit('send_message', { content: 'After revocation' });
  await disconnected;
  assert.equal(received(), 0);
});
