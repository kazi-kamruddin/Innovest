import { expect, test } from '@playwright/test';
import { loadTestAccounts } from './accounts.js';

test('deployed Knock opens the other member conversation', async ({ page, request }) => {
  test.skip(!process.env.INNOVEST_TEST_ACCOUNTS_FILE || !process.env.INNOVEST_TEST_API_URL ||
    !process.env.INNOVEST_TEST_SITE_URL,
  'Set the two-account file, API URL, and deployed site URL.');

  const api = process.env.INNOVEST_TEST_API_URL.replace(/\/+$/, '');
  const { accountA, accountB } = loadTestAccounts();
  const otherLogin = await request.post(`${api}/user/login`, { data: accountB });
  expect(otherLogin.status()).toBe(200);
  const { user: otherUser } = await otherLogin.json();

  await page.goto('/login');
  await page.getByLabel('Email address').fill(accountA.email);
  await page.getByLabel('Password', { exact: true }).fill(accountA.password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect.poll(() => page.evaluate(() => Boolean(localStorage.getItem('token')))).toBe(true);

  await page.goto(`/profile/${otherUser.id}`);
  await page.getByRole('button', { name: 'Knock / Message' }).first().click();
  await expect(page).toHaveURL(/\/messages\?conversation=\d+$/);
  await expect(page.getByRole('heading', { name: otherUser.name }).first()).toBeVisible();
});

test('deployed public member profile omits login email', async ({ request }) => {
  test.skip(!process.env.INNOVEST_TEST_ACCOUNTS_FILE || !process.env.INNOVEST_TEST_API_URL,
    'Set the two-account file and API URL.');

  const api = process.env.INNOVEST_TEST_API_URL.replace(/\/+$/, '');
  const login = await request.post(`${api}/user/login`, { data: loadTestAccounts().accountB });
  expect(login.status()).toBe(200);
  const { user } = await login.json();
  const profile = await request.get(`${api}/profile/${user.id}`);
  expect(profile.status()).toBe(200);
  const payload = await profile.json();
  expect(payload.user).not.toHaveProperty('email');
  expect(payload.user).not.toHaveProperty('user_email');
});
