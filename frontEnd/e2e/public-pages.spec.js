import { expect, test } from '@playwright/test';

test('every public route renders without a client exception', async ({ page }) => {
  const failures = [];
  page.on('pageerror', (error) => failures.push(error.message));
  for (const path of [
    '/', '/about-us', '/help', '/privacy', '/terms', '/login', '/signup',
    '/forgot-password', '/check-email', '/verify-email', '/reset-password',
    '/investor-list', '/pitches',
  ]) {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 }).first(), `Main heading on ${path}`).toBeVisible();
    expect(failures, `Client exceptions on ${path}`).toEqual([]);
  }
});
