import { expect, test } from '@playwright/test';

test('deployed account endpoints reject invalid input and protect member data', async ({ request }) => {
  test.skip(!process.env.INNOVEST_TEST_API_URL, 'Set INNOVEST_TEST_API_URL for deployed API checks.');
  const api = process.env.INNOVEST_TEST_API_URL.replace(/\/+$/, '');
  const checks = [
    ['POST', '/user/register', { name: 'E2E', email: 'not-an-email', password: 'long-enough-password' }, 400],
    ['POST', '/user/forgot-password', { email: 'not-an-email' }, 400],
    ['POST', '/user/verify-email', { token: 'invalid' }, 400],
    ['POST', '/user/reset-password', { token: 'invalid', password: 'long-enough-password' }, 400],
    ['POST', '/user/google', { credential: 'invalid' }, 400],
  ];
  for (const [method, path, data, expected] of checks) {
    const response = await request.fetch(`${api}${path}`, { method, data });
    expect(response.status(), `${path} should reject invalid input`).toBe(expected);
  }
  for (const path of ['/notifications', '/conversations', '/investor-request', '/pitches/users/1/pitches']) {
    const response = await request.get(`${api}${path}`);
    expect(response.status(), `${path} requires a session`).toBe(401);
  }
});
