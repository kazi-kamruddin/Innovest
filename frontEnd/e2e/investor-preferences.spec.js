import { expect, test } from '@playwright/test';
import { loadTestAccounts } from './accounts.js';

test('investor preferences validate, save, appear publicly, and restore', async ({ browser, request }) => {
  test.skip(process.env.INNOVEST_TEST_WRITE !== '1' || !process.env.INNOVEST_TEST_API_URL ||
    !process.env.INNOVEST_TEST_ACCOUNTS_FILE, 'Requires the two accounts and INNOVEST_TEST_WRITE=1.');

  const api = process.env.INNOVEST_TEST_API_URL.replace(/\/+$/, '');
  const { accountA, accountB } = loadTestAccounts();
  const [founderLogin, investorLogin] = await Promise.all([
    request.post(`${api}/user/login`, { data: accountA }),
    request.post(`${api}/user/login`, { data: accountB }),
  ]);
  expect(founderLogin.status()).toBe(200);
  expect(investorLogin.status()).toBe(200);
  const founder = await founderLogin.json();
  const investor = await investorLogin.json();
  const investorHeaders = { Authorization: `Bearer ${investor.token}` };
  const originalResponse = await request.get(`${api}/investor-info/${investor.user.id}`, { headers: investorHeaders });
  expect(originalResponse.status()).toBe(200);
  const original = await originalResponse.json();
  const context = await browser.newContext();
  await context.addInitScript(({ token, user }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }, investor);

  try {
    const forbidden = await request.post(`${api}/investor-info`, {
      headers: { Authorization: `Bearer ${founder.token}` },
      data: { user_id: investor.user.id, investment_range_min: 100, investment_range_max: 1000 },
    });
    expect(forbidden.status()).toBe(403);

    const page = await context.newPage();
    await page.goto('/profile/investor-info');
    await expect(page.getByRole('heading', { name: /Investor preferences/i })).toBeVisible();
    await page.getByLabel('Minimum investment *').fill('9000');
    await page.getByLabel('Maximum investment *').fill('1000');
    await page.getByRole('button', { name: 'Save preferences' }).click();
    await expect(page.getByRole('alert')).toContainText('maximum must be at least the minimum');

    await page.getByLabel('Minimum investment *').fill('1234');
    await page.getByLabel('Maximum investment *').fill('9876');
    const saved = page.waitForResponse((response) => response.url() === `${api}/investor-info` && response.request().method() === 'POST');
    await page.getByRole('button', { name: 'Save preferences' }).click();
    expect((await saved).status()).toBe(201);

    const publicResponse = await request.get(`${api}/investor-info/public/${investor.user.id}`);
    expect(publicResponse.status()).toBe(200);
    const publicProfile = await publicResponse.json();
    expect(Number(publicProfile.investment_range_min)).toBe(1234);
    expect(Number(publicProfile.investment_range_max)).toBe(9876);
  } finally {
    const restored = await request.post(`${api}/investor-info`, {
      headers: investorHeaders,
      data: {
        user_id: investor.user.id,
        fields_of_interest: original.fields_of_interest,
        preferred_industries: original.preferred_industries,
        investment_range_min: original.investment_range_min,
        investment_range_max: original.investment_range_max,
      },
    });
    expect(restored.status(), 'Restore investor preferences').toBe(201);
    await context.close();
  }
});
