import { expect, test } from '@playwright/test';
import { loadTestAccounts } from './accounts.js';

test('bulk read clears only the recipient notifications', async ({ browser, request }) => {
  test.skip(process.env.INNOVEST_TEST_WRITE !== '1' || !process.env.INNOVEST_TEST_API_URL ||
    !process.env.INNOVEST_TEST_ACCOUNTS_FILE, 'Requires the two accounts and INNOVEST_TEST_WRITE=1.');
  const api = process.env.INNOVEST_TEST_API_URL.replace(/\/+$/, '');
  const { accountA, accountB } = loadTestAccounts();
  const [senderLogin, recipientLogin] = await Promise.all([
    request.post(`${api}/user/login`, { data: accountA }),
    request.post(`${api}/user/login`, { data: accountB }),
  ]);
  expect(senderLogin.status()).toBe(200);
  expect(recipientLogin.status()).toBe(200);
  const sender = await senderLogin.json();
  const recipient = await recipientLogin.json();
  const senderHeaders = { Authorization: `Bearer ${sender.token}` };
  const recipientHeaders = { Authorization: `Bearer ${recipient.token}` };

  const started = await request.post(`${api}/conversations/start`, {
    headers: senderHeaders, data: { targetUserId: recipient.user.id },
  });
  expect([200, 201]).toContain(started.status());
  const conversation = await started.json();
  const sent = await request.post(`${api}/conversations/${conversation.id}/messages`, {
    headers: senderHeaders,
    data: { content: `E2E disposable bulk-notification check ${Date.now()}` },
  });
  expect(sent.status()).toBe(201);

  const before = await request.get(`${api}/notifications`, { headers: recipientHeaders });
  expect(before.status()).toBe(200);
  const beforeData = await before.json();
  expect(beforeData.unread).toBeGreaterThan(0);
  const senderBefore = await request.get(`${api}/notifications`, { headers: senderHeaders });
  expect(senderBefore.status()).toBe(200);
  const senderUnread = (await senderBefore.json()).unread;

  const context = await browser.newContext();
  await context.addInitScript(({ token, user }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }, recipient);
  try {
    const page = await context.newPage();
    await page.goto('/notifications');
    await expect(page.getByRole('button', { name: 'Mark all as read' })).toBeVisible();
    await page.getByRole('button', { name: 'Mark all as read' }).click();
    await expect.poll(async () => {
      const response = await request.get(`${api}/notifications`, { headers: recipientHeaders });
      return (await response.json()).unread;
    }).toBe(0);
    await expect(page.getByRole('button', { name: 'Mark all as read' })).toHaveCount(0);
    const senderAfter = await request.get(`${api}/notifications`, { headers: senderHeaders });
    expect((await senderAfter.json()).unread).toBe(senderUnread);
  } finally {
    await context.close();
  }
});
