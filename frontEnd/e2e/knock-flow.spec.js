import { expect, test } from '@playwright/test';

test('Knock uses the conversation API and opens the returned thread', async ({ browser }) => {
  test.skip(!process.env.INNOVEST_TEST_API_URL || /^https?:\/\//.test(process.env.INNOVEST_TEST_SITE_URL || ''),
    'Run this mocked UX regression against the local frontend.');
  const api = process.env.INNOVEST_TEST_API_URL.replace(/\/+$/, '');
  const context = await browser.newContext();
  const token = `${Buffer.from('{}').toString('base64url')}.${Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url')}.test`;
  await context.addInitScript(({ sessionToken }) => {
    localStorage.setItem('token', sessionToken);
    localStorage.setItem('user', JSON.stringify({ id: 1001, name: 'Test Founder', email: 'test@example.invalid' }));
  }, { sessionToken: token });
  const page = await context.newPage();
  try {
    await page.route(`${api}/profile/1002`, (route) => route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ user: { id: 1002, name: 'Test Investor' } }),
    }));
    await page.route(`${api}/investor-info/public/1002`, (route) => route.fulfill({ status: 404, body: '{}' }));
    await page.route(`${api}/conversations/start`, async (route) => {
      expect(route.request().postDataJSON()).toEqual({ targetUserId: 1002 });
      await new Promise((resolve) => setTimeout(resolve, 400));
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 42 }) });
    });
    await page.route(`${api}/conversations`, (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([
      { id: 42, user_one_id: 1001, user_two_id: 1002, user1_name: 'Test Founder', user2_name: 'Test Investor' },
    ]) }));
    await page.route(`${api}/conversations/42/messages`, (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
    await page.goto('/profile/1002');
    await page.getByRole('button', { name: 'Knock / Message' }).first().click();
    await expect(page).toHaveURL(/\/messages\?conversation=42$/);
    await expect(page.getByRole('heading', { name: 'Test Investor' }).first()).toBeVisible();
  } finally {
    await context.close();
  }
});
