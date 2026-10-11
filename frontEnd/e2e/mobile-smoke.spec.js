import { expect, test } from '@playwright/test';
import { loadTestAccounts } from './accounts.js';

async function assertNoHorizontalOverflow(page, path) {
  await page.goto(path);
  await expect(page.locator('body')).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  const dimensions = await page.evaluate(() => ({
    content: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
  }));
  expect(dimensions.content, `${path} should fit a narrow phone viewport`).toBeLessThanOrEqual(dimensions.viewport + 2);
}

test('main guest and member pages fit a narrow mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ['/', '/login', '/signup', '/pitches']) {
    await assertNoHorizontalOverflow(page, path);
  }
  await page.goto('/');
  await page.getByRole('button', { name: 'Open navigation menu' }).click();
  await expect(page.getByRole('button', { name: 'Close navigation menu' })).toHaveAttribute('aria-expanded', 'true');
  await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: 'Investor Requests' }).click();
  await expect(page).toHaveURL(/\/investor-request$/);
  await expect(page.getByRole('button', { name: 'Open navigation menu' })).toHaveAttribute('aria-expanded', 'false');
  test.skip(!process.env.INNOVEST_TEST_ACCOUNTS_FILE, 'Set the two-account file for signed-in mobile checks.');
  const account = loadTestAccounts().accountA;
  await page.goto('/login');
  await page.getByLabel('Email address').fill(account.email);
  await page.getByLabel('Password', { exact: true }).fill(account.password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect.poll(() => page.evaluate(() => Boolean(localStorage.getItem('token'))), { timeout: 90_000 }).toBe(true);
  for (const path of ['/profile', '/investor-request', '/fundraise-dashboard', '/messages', '/notifications']) {
    await assertNoHorizontalOverflow(page, path);
  }
});
