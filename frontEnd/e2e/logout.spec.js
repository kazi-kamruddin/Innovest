import { expect, test } from '@playwright/test';
import { loadTestAccounts } from './accounts.js';

test('logging out revokes the browser token while the account can sign in again', async ({ page, request }) => {
  test.skip(process.env.INNOVEST_TEST_WRITE !== '1' || !process.env.INNOVEST_TEST_ACCOUNTS_FILE || !process.env.INNOVEST_TEST_API_URL,
    'Set INNOVEST_TEST_WRITE=1, the two-account file and API URL for token-revocation verification.');
  const account = loadTestAccounts().accountA;
  const api = process.env.INNOVEST_TEST_API_URL.replace(/\/+$/, '');
  await page.goto('/login');
  await page.getByLabel('Email address').fill(account.email);
  await page.getByLabel('Password', { exact: true }).fill(account.password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect.poll(() => page.evaluate(() => Boolean(localStorage.getItem('token'))), { timeout: 90_000 }).toBe(true);
  const token = await page.evaluate(() => localStorage.getItem('token'));
  await page.goto('/profile');
  await page.getByRole('button', { name: 'Log out of Innovest' }).click();
  await expect.poll(() => page.evaluate(() => localStorage.getItem('token'))).toBeNull();
  await expect.poll(async () => {
    const response = await request.get(`${api}/notifications`, { headers: { Authorization: `Bearer ${token}` } });
    return response.status();
  }, { timeout: 15_000 }).toBe(401);
  await page.goto('/login');
  await page.getByLabel('Email address').fill(account.email);
  await page.getByLabel('Password', { exact: true }).fill(account.password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect.poll(() => page.evaluate(() => Boolean(localStorage.getItem('token'))), { timeout: 90_000 }).toBe(true);
});
