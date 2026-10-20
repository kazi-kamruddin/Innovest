import { expect, test } from '@playwright/test';

const api = process.env.INNOVEST_TEST_API_URL?.replace(/\/+$/, '');
const session = (id) => ({
  token: `${Buffer.from('{}').toString('base64url')}.${Buffer.from(JSON.stringify({ id, exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url')}.test`,
  user: { id, name: `Test member ${id}`, email: `member${id}@example.invalid` },
});

test('private response editor sends its session and loads the owner pitch', async ({ page }) => {
  test.skip(!api, 'Set the API URL for mocked regression checks.');
  const member = session(1001);
  await page.addInitScript((saved) => {
    localStorage.setItem('token', saved.token);
    localStorage.setItem('user', JSON.stringify(saved.user));
  }, member);
  await page.route(`${api}/notifications`, (route) => route.fulfill({ json: { items: [], unread: 0 } }));
  await page.route(`${api}/pitches/42`, (route) => route.fulfill(
    route.request().headers().authorization === `Bearer ${member.token}`
      ? { json: { id: 42, user_id: 1001, forRequestId: 5, title: 'Private response to edit', industry: 'Technology' } }
      : { status: 404, json: { error: 'Pitch not found' } },
  ));
  await page.goto('/fundraise-dashboard/edit-pitch/42');
  await expect(page.getByLabel('Pitch title')).toHaveValue('Private response to edit');
});

test('a second tab follows account changes and logout without retaining the old profile', async ({ context, page }) => {
  test.skip(!api, 'Set the API URL for mocked regression checks.');
  await context.route(`${api}/notifications`, (route) => route.fulfill({ json: { items: [], unread: 0 } }));
  await context.route(`${api}/profile/*`, (route) => {
    const id = Number(route.request().url().split('/').pop());
    return route.fulfill({ json: { user: session(id).user, about: `Profile of member ${id}` } });
  });
  await context.route(`${api}/investor-info/*`, (route) => route.fulfill({ status: 404, json: {} }));
  await page.goto('/login');
  await page.evaluate((saved) => {
    localStorage.setItem('token', saved.token);
    localStorage.setItem('user', JSON.stringify(saved.user));
  }, session(1001));
  await page.goto('/profile');
  await expect(page.getByText('Profile of member 1001')).toBeVisible();
  const otherTab = await context.newPage();
  await otherTab.goto('/');
  await expect(otherTab.getByRole('link', { name: 'Dashboard' }).first()).toBeVisible();
  await otherTab.evaluate((saved) => {
    localStorage.setItem('token', saved.token);
    localStorage.setItem('user', JSON.stringify(saved.user));
  }, session(1002));
  await expect(page.getByText('Profile of member 1002')).toBeVisible();
  await expect(page.getByText('Profile of member 1001')).toHaveCount(0);
  await otherTab.evaluate(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  });
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByText('Profile of member 1002')).toHaveCount(0);
});
