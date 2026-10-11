import { expect, test } from '@playwright/test';
import { loadTestAccounts } from './accounts.js';

test('investor requests do not flash the wrong tab while profile status is delayed', async ({ browser, request }) => {
  test.skip(!process.env.INNOVEST_TEST_ACCOUNTS_FILE || !process.env.INNOVEST_TEST_API_URL ||
    /^https?:\/\//.test(process.env.INNOVEST_TEST_SITE_URL || ''),
  'Run this regression against the local frontend with the two-account file and API URL.');
  const apiBase = process.env.INNOVEST_TEST_API_URL.replace(/\/+$/, '');
  const account = loadTestAccounts().accountB;
  const login = await request.post(`${apiBase}/user/login`, { data: account });
  expect(login.status()).toBe(200);
  const { token, user } = await login.json();
  const context = await browser.newContext();
  await context.addInitScript(({ storedToken, storedUser }) => {
    localStorage.setItem('token', storedToken);
    localStorage.setItem('user', JSON.stringify(storedUser));
  }, { storedToken: token, storedUser: user });
  const page = await context.newPage();
  const ownTitle = 'E2E mocked own request';
  const otherTitle = 'E2E mocked other request';
  try {
    await page.route(`${apiBase}/investor-info/${user.id}`, async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ user_id: user.id }) });
    });
    await page.route(`${apiBase}/investor-request`, (route) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 900001, investorId: user.id, title: ownTitle, description: 'Own request', category: 'Technology', status: 'open' },
        { id: 900002, investorId: user.id + 999, title: otherTitle, description: 'Other request', category: 'Education', status: 'open' },
      ]),
    }));
    await page.goto('/investor-request');
    await expect(page.getByRole('status', { name: /Loading investor requests/i })).toBeVisible();
    await expect(page.getByText(otherTitle)).toHaveCount(0);
    await expect(page.getByText(ownTitle)).toHaveCount(0);
    await expect(page.getByRole('heading', { name: ownTitle })).toBeVisible();
    await expect(page.getByText(otherTitle)).toHaveCount(0);
    await expect(page.getByRole('button', { name: /My requests/i })).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: /Other investors/i }).click();
    await expect(page.getByRole('heading', { name: otherTitle })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Respond with a pitch' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Responses' })).toHaveCount(0);
  } finally {
    await context.close();
  }
});
