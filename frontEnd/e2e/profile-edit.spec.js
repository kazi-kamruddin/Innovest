import { expect, test } from '@playwright/test';
import { loadTestAccounts } from './accounts.js';

const apiBase = process.env.INNOVEST_TEST_API_URL?.replace(/\/+$/, '');

async function signIn(page, account) {
  await page.goto('/login');
  await page.getByLabel('Email address').fill(account.email);
  await page.getByLabel('Password', { exact: true }).fill(account.password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect.poll(() => page.evaluate(() => Boolean(localStorage.getItem('token'))), { timeout: 90_000 }).toBe(true);
  return page.evaluate(() => ({ id: JSON.parse(localStorage.getItem('user')).id, token: localStorage.getItem('token') }));
}

test('profile edits persist publicly and reject cross-account changes', async ({ browser, request }) => {
  test.skip(process.env.INNOVEST_TEST_WRITE !== '1' || !apiBase || !process.env.INNOVEST_TEST_ACCOUNTS_FILE,
    'Stateful live profile test requires INNOVEST_TEST_WRITE=1, API URL and two accounts.');
  const accounts = loadTestAccounts();
  const founderPage = await browser.newPage();
  const investorPage = await browser.newPage();
  let founder;
  let original;
  try {
    founder = await signIn(founderPage, accounts.accountA);
    const investor = await signIn(investorPage, accounts.accountB);
    const before = await request.get(`${apiBase}/profile/${founder.id}`);
    expect(before.status()).toBe(200);
    original = await before.json();

    const forbidden = await request.post(`${apiBase}/profile/${founder.id}/edit-profile`, {
      headers: { Authorization: `Bearer ${investor.token}`, 'Content-Type': 'application/json' },
      data: { location: 'unauthorized', about: 'unauthorized', areas_of_interest: '' },
    });
    expect(forbidden.status()).toBe(403);

    const location = `E2E disposable location ${Date.now()}`;
    const about = `E2E disposable profile introduction ${Date.now()}`;
    await founderPage.goto('/profile/edit-profile');
    await founderPage.getByLabel('Location').fill(location);
    await founderPage.getByLabel('About').fill(about);
    const saving = founderPage.waitForResponse((response) =>
      response.url() === `${apiBase}/profile/${founder.id}/edit-profile` && response.request().method() === 'POST');
    await founderPage.getByRole('button', { name: 'Save changes' }).click();
    expect([200, 201]).toContain((await saving).status());

    await investorPage.goto(`/profile/${founder.id}`);
    await expect(investorPage.getByText(location, { exact: true }).first()).toBeVisible();
    await expect(investorPage.getByText(about, { exact: true }).first()).toBeVisible();
    console.log('Live profile passed: edit, public visibility and cross-account write denial.');
  } finally {
    if (founder && original) {
      const restored = await request.post(`${apiBase}/profile/${founder.id}/edit-profile`, {
        headers: { Authorization: `Bearer ${founder.token}`, 'Content-Type': 'application/json' },
        data: {
          user_id: founder.id,
          location: original.location || '',
          about: original.about || '',
          areas_of_interest: original.areas_of_interest || '',
        },
      });
      console.log(`Disposable profile cleanup: ${restored.ok() ? 'original values restored' : `failed (HTTP ${restored.status()})`}.`);
    }
    await founderPage.close();
    await investorPage.close();
  }
});
