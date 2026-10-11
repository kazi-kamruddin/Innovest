import { expect, test } from '@playwright/test';

test('direct message link waits for inbox and history before showing an empty chat', async ({ browser }) => {
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
    await page.route(`${api}/conversations`, async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([
        { id: 42, user_one_id: 1001, user_two_id: 1002, user1_name: 'Test Founder', user2_name: 'Test Investor' },
      ]) });
    });
    await page.route(`${api}/conversations/42/messages`, async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([
        { id: 1, conversation_id: 42, sender_id: 1002, content: 'Saved test message', created_at: new Date().toISOString() },
      ]) });
    });
    await page.route(`${api}/profile/1002`, (route) => route.fulfill({ status: 404, contentType: 'application/json', body: '{}' }));
    await page.goto('/messages?conversation=42');
    await expect(page.getByText('Loading conversations...').first()).toBeVisible();
    await expect(page.getByText('Your next conversation starts here.')).toHaveCount(0);
    await expect(page.getByText('Loading messages...')).toBeVisible();
    await expect(page.getByText(/Say hello to/i)).toHaveCount(0);
    await expect(page.getByRole('log').getByText('Saved test message')).toBeVisible();
    await expect(page.getByText(/Say hello to/i)).toHaveCount(0);
  } finally {
    await context.close();
  }
});
