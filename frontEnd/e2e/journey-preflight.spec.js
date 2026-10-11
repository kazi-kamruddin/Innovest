import { expect, test } from '@playwright/test';
import { loadTestAccounts } from './accounts.js';

test('disposable accounts are ready for the investor journey', async ({ browser, request }) => {
  test.skip(!process.env.INNOVEST_TEST_ACCOUNTS_FILE || !process.env.INNOVEST_TEST_API_URL);
  const accounts = loadTestAccounts();
  const apiBase = process.env.INNOVEST_TEST_API_URL.replace(/\/+$/, '');
  const results = {};

  for (const accountName of ['accountA', 'accountB']) {
    const page = await browser.newPage();
    try {
      await page.goto('/login');
      await page.getByLabel('Email address').fill(accounts[accountName].email);
      await page.getByLabel('Password', { exact: true }).fill(accounts[accountName].password);
      await page.getByRole('button', { name: 'Sign in', exact: true }).click();
      await expect.poll(() => page.evaluate(() => Boolean(localStorage.getItem('token'))), { timeout: 90_000 }).toBe(true);
      const session = await page.evaluate(() => ({
        id: JSON.parse(localStorage.getItem('user')).id,
        token: localStorage.getItem('token'),
      }));
      const profile = await request.get(`${apiBase}/investor-info/${session.id}`, {
        headers: { Authorization: `Bearer ${session.token}` },
      });
      expect([200, 404]).toContain(profile.status());
      results[accountName] = profile.status() === 200 ? 'investor profile exists' : 'investor profile absent';
    } finally {
      await page.close();
    }
  }
  console.log(`Investor journey preflight: accountA ${results.accountA}; accountB ${results.accountB}.`);
});
