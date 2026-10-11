import { expect, test } from '@playwright/test';
import { loadTestAccounts } from './accounts.js';

test('investor and pitch discovery handle search, empty results and reset', async ({ page }) => {
  test.skip(!process.env.INNOVEST_TEST_ACCOUNTS_FILE, 'Set the two-account file for member discovery checks.');
  const account = loadTestAccounts().accountA;
  await page.goto('/login');
  await page.getByLabel('Email address').fill(account.email);
  await page.getByLabel('Password', { exact: true }).fill(account.password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect.poll(() => page.evaluate(() => Boolean(localStorage.getItem('token'))), { timeout: 90_000 }).toBe(true);

  await page.goto('/investor-list');
  await expect(page.getByRole('status', { name: 'Loading investors' })).toHaveCount(0);
  await expect(page.getByRole('alert')).toHaveCount(0);
  await page.getByPlaceholder('Name, interests or industry').fill('zzzz-no-matching-investor-987654');
  await expect(page.getByRole('heading', { name: 'No matching investors' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(page.getByRole('heading', { name: 'No matching investors' })).toHaveCount(0);

  await page.goto('/pitches');
  await expect(page.getByText('Loading available pitches...')).toHaveCount(0);
  await page.getByPlaceholder('Search by pitch title or country...').fill('zzzz-no-matching-pitch-987654');
  await expect(page.getByRole('heading', { name: 'No matching opportunities' })).toBeVisible();
  await page.getByRole('button', { name: /Clear all filters/i }).first().click();
  await expect(page.getByRole('heading', { name: 'No matching opportunities' })).toHaveCount(0);
});
