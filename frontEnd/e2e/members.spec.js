import { expect, test } from '@playwright/test';
import { loadTestAccounts } from './accounts.js';

async function signIn(page, account) {
  await page.goto('/login');
  await page.getByLabel('Email address').fill(account.email);
  await page.getByLabel('Password', { exact: true }).fill(account.password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();

  await expect.poll(async () => page.evaluate(() => {
    try { return JSON.parse(localStorage.getItem('user'))?.email?.toLowerCase(); }
    catch { return null; }
  }), { timeout: 90_000 }).toBe(account.email.toLowerCase());

  return page.evaluate(() => ({
    token: localStorage.getItem('token'),
    id: JSON.parse(localStorage.getItem('user')).id,
  }));
}

test.describe('two disposable member accounts', () => {
  test.skip(!process.env.INNOVEST_TEST_ACCOUNTS_FILE, 'Set INNOVEST_TEST_ACCOUNTS_FILE to run member checks.');
  for (const accountName of ['accountA', 'accountB']) {
    test(`${accountName} signs in and loads private pages`, async ({ page }) => {
      const account = loadTestAccounts()[accountName];
      await signIn(page, account);

    await page.goto('/profile');
    await expect(page.getByRole('heading', { name: /Your profile/i })).toBeVisible();
    await expect(page.getByText('Your profile could not be loaded.')).toHaveCount(0);

    await page.goto('/notifications');
    await expect(page.getByRole('heading', { name: 'Notifications' })).toBeVisible();
    await expect(page.getByText('Loading notifications...')).toHaveCount(0);
    await expect(page.getByRole('alert')).toHaveCount(0);

    await page.goto('/investor-request');
    await expect(page.getByRole('heading', { name: /Investor requests/i })).toBeVisible();
    await expect(page.getByText('Loading requests...')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: "Requests aren't loading" })).toHaveCount(0);

    await page.goto('/messages');
    await expect(page.getByRole('heading', { name: /Messages.*conversations/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Inbox' })).toBeVisible();
    });
  }

  test.describe('cross-account authorization', () => {
    test.skip(!process.env.INNOVEST_TEST_API_URL, 'Set INNOVEST_TEST_API_URL to check API ownership.');
    test('one account cannot read the other account private pitch list', async ({ browser, request }) => {
      const accounts = loadTestAccounts();
      const pageA = await browser.newPage();
      const pageB = await browser.newPage();
      try {
        const sessionA = await signIn(pageA, accounts.accountA);
        const sessionB = await signIn(pageB, accounts.accountB);
        const apiBase = process.env.INNOVEST_TEST_API_URL.replace(/\/+$/, '');

        const own = await request.get(`${apiBase}/pitches/users/${sessionA.id}/pitches`, {
          headers: { Authorization: `Bearer ${sessionA.token}` },
        });
        expect(own.status()).toBe(200);

        const cross = await request.get(`${apiBase}/pitches/users/${sessionB.id}/pitches`, {
          headers: { Authorization: `Bearer ${sessionA.token}` },
        });
        expect(cross.status()).toBe(403);
      } finally {
        await pageA.close();
        await pageB.close();
      }
    });
  });
});
