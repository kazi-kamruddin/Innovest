import { expect, test } from '@playwright/test';
import { io } from 'socket.io-client';
import { loadTestAccounts } from './accounts.js';

function once(socket, event) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timed out waiting for ${event}`)), 10_000);
    socket.once(event, (payload) => { clearTimeout(timer); resolve(payload); });
  });
}

test('malformed socket actions return errors without disconnecting the user', async ({ request }) => {
  test.skip(!process.env.INNOVEST_TEST_API_URL || !process.env.INNOVEST_TEST_ACCOUNTS_FILE,
    'Requires API URL and a disposable account.');
  const api = process.env.INNOVEST_TEST_API_URL.replace(/\/+$/, '');
  const login = await request.post(`${api}/user/login`, { data: loadTestAccounts().accountA });
  expect(login.status()).toBe(200);
  const { token } = await login.json();
  const socket = io(api, { auth: { token }, transports: ['websocket'], reconnection: false });
  try {
    await once(socket, 'connect');
    const knockError = once(socket, 'knock_error');
    socket.emit('knock_user');
    expect((await knockError).message).toBe('Invalid recipient');

    const missingMessageError = once(socket, 'send_message_error');
    socket.emit('send_message');
    expect((await missingMessageError).message).toBe('Message content is required');

    const longMessageError = once(socket, 'send_message_error');
    socket.emit('send_message', { conversationId: 1, content: 'x'.repeat(4001) });
    expect((await longMessageError).message).toMatch(/4000 characters/);
    expect(socket.connected).toBe(true);
  } finally {
    socket.disconnect();
  }
});
