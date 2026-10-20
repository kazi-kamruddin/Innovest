import { expect, test } from '@playwright/test';

const api = process.env.INNOVEST_TEST_API_URL?.replace(/\/+$/, '');
test.beforeEach(async ({ page }) => {
  test.skip(!api, 'Set the API URL for mocked regression checks.');
  const token = `${Buffer.from('{}').toString('base64url')}.${Buffer.from(JSON.stringify({ id: 1001, exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url')}.test`;
  await page.addInitScript((saved) => {
    localStorage.setItem('token', saved);
    localStorage.setItem('user', JSON.stringify({ id: 1001, name: 'Test founder', email: 'member@example.invalid' }));
  }, token);
});

test('a failed notification request does not claim the inbox is empty', async ({ page }) => {
  await page.route(`${api}/notifications`, (route) => route.fulfill({ status: 503, json: { error: 'Notifications unavailable' } }));
  await page.goto('/notifications');
  await expect(page.getByRole('alert')).toContainText('Notifications unavailable');
  await expect(page.getByRole('heading', { name: 'All caught up' })).toHaveCount(0);
});

test('a delayed poll cannot undo a successful mark-all-read', async ({ page }) => {
  await page.clock.install();
  let delayPolls = false;
  let pending = 0;
  let completed = 0;
  let release;
  const gate = new Promise((resolve) => { release = resolve; });
  const item = { id: 1, text: 'Test unread update', target_path: '/fundraise-dashboard', created_at: new Date().toISOString(), read_at: null };
  await page.route(`${api}/notifications`, async (route) => {
    if (delayPolls) { pending += 1; await gate; }
    await route.fulfill({ json: { items: [item], unread: 1 } });
    if (delayPolls) completed += 1;
  });
  await page.route(`${api}/notifications/read-all`, (route) => route.fulfill({ json: { message: 'Read' } }));
  try {
    await page.goto('/notifications');
    await expect(page.getByRole('button', { name: 'Mark all as read' })).toBeVisible();
    delayPolls = true;
    await page.clock.fastForward(30000);
    await expect.poll(() => pending).toBeGreaterThan(0);
    await page.getByRole('button', { name: 'Mark all as read' }).click();
    await expect(page.getByRole('button', { name: 'Mark all as read' })).toHaveCount(0);
    release();
    await expect.poll(() => completed).toBe(pending);
    await expect(page.locator('.iv-notification-item.unread')).toHaveCount(0);
  } finally { release(); }
});
