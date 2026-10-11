import { expect, test } from '@playwright/test';

test('API process and database are ready for account flows', async ({ request }) => {
  test.skip(!process.env.INNOVEST_TEST_API_URL, 'Set INNOVEST_TEST_API_URL to check the backend.');
  const base = process.env.INNOVEST_TEST_API_URL.replace(/\/+$/, '');
  const health = await request.get(`${base}/health`, { timeout: 90_000 });
  expect(health.status(), '/health should show that the HTTP process is running').toBe(200);

  const ready = await request.get(`${base}/ready`, { timeout: 90_000 });
  expect(ready.status(), '/ready should confirm the database and required tables are available').toBe(200);
  expect((await ready.json()).status).toBe('ready');
});
