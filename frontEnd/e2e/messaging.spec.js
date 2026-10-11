import { expect, test } from '@playwright/test';
import { loadTestAccounts } from './accounts.js';

async function signIn(page, account) {
  await page.goto('/login');
  await page.getByLabel('Email address').fill(account.email);
  await page.getByLabel('Password', { exact: true }).fill(account.password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect.poll(() => page.evaluate(() => Boolean(localStorage.getItem('token'))), { timeout: 90_000 }).toBe(true);
  return page.evaluate(() => ({
    id: JSON.parse(localStorage.getItem('user')).id,
    token: localStorage.getItem('token'),
  }));
}

test('two accounts exchange, reload and protect private messages', async ({ browser, request }) => {
  test.skip(process.env.INNOVEST_TEST_WRITE !== '1' || !process.env.INNOVEST_TEST_API_URL || !process.env.INNOVEST_TEST_ACCOUNTS_FILE,
    'Stateful live messaging test requires INNOVEST_TEST_WRITE=1, API URL and two accounts.');
  const apiBase = process.env.INNOVEST_TEST_API_URL.replace(/\/+$/, '');
  const accounts = loadTestAccounts();
  const founderPage = await browser.newPage();
  const investorPage = await browser.newPage();
  try {
    const founder = await signIn(founderPage, accounts.accountA);
    const investor = await signIn(investorPage, accounts.accountB);
    const started = await request.post(`${apiBase}/conversations/start`, {
      headers: { Authorization: `Bearer ${founder.token}`, 'Content-Type': 'application/json' },
      data: { targetUserId: Number(investor.id) },
    });
    expect([200, 201]).toContain(started.status());
    const conversation = await started.json();
    expect(conversation?.id).toBeTruthy();

    const firstText = `E2E disposable founder message ${Date.now()}`;
    const secondText = `E2E disposable investor reply ${Date.now()}`;
    await founderPage.goto(`/messages?conversation=${conversation.id}`);
    await investorPage.goto(`/messages?conversation=${conversation.id}`);
    await expect(founderPage.getByText('Live', { exact: true })).toBeVisible();
    await expect(investorPage.getByText('Live', { exact: true })).toBeVisible();
    await founderPage.getByLabel('Write a message').fill(firstText);
    await founderPage.getByRole('button', { name: 'Send', exact: true }).click();
    await expect(founderPage.getByRole('log').getByText(firstText)).toBeVisible();

    await expect(investorPage.getByRole('log').getByText(firstText)).toBeVisible();
    await investorPage.getByLabel('Write a message').fill(secondText);
    await investorPage.getByRole('button', { name: 'Send', exact: true }).click();
    await expect(investorPage.getByRole('log').getByText(secondText)).toBeVisible();

    await founderPage.reload();
    await expect(founderPage.getByRole('log').getByText(firstText)).toBeVisible();
    await expect(founderPage.getByRole('log').getByText(secondText)).toBeVisible();
    await investorPage.goto('/notifications');
    await expect(investorPage.getByText('You have a new message.').first()).toBeVisible();
    const notificationResponse = await request.get(`${apiBase}/notifications`, {
      headers: { Authorization: `Bearer ${investor.token}` },
    });
    expect(notificationResponse.status()).toBe(200);
    const notification = (await notificationResponse.json()).items.find((item) =>
      item.kind === 'message' && item.target_path === `/messages?conversation=${conversation.id}` && !item.read_at);
    expect(notification?.id).toBeTruthy();
    const forbiddenRead = await request.patch(`${apiBase}/notifications/${notification.id}/read`, {
      headers: { Authorization: `Bearer ${founder.token}` },
    });
    expect(forbiddenRead.status()).toBe(404);
    await investorPage.getByRole('article').filter({ hasText: 'You have a new message.' }).first()
      .getByRole('button', { name: 'Mark read' }).click();
    await expect.poll(async () => {
      const response = await request.get(`${apiBase}/notifications`, {
        headers: { Authorization: `Bearer ${investor.token}` },
      });
      return Boolean((await response.json()).items.find((item) => item.id === notification.id)?.read_at);
    }).toBe(true);
    const guest = await request.get(`${apiBase}/conversations/${conversation.id}/messages`);
    expect([401, 403]).toContain(guest.status());
    console.log('Live messaging passed: conversation API, realtime delivery, persistence, notification read state, and guest/other-account denial.');
  } finally {
    await founderPage.close();
    await investorPage.close();
  }
});
