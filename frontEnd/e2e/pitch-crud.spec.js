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

test('standalone pitch can be created, viewed, edited and deleted with owner checks', async ({ browser, request }) => {
  test.skip(process.env.INNOVEST_TEST_WRITE !== '1' || !apiBase || !process.env.INNOVEST_TEST_ACCOUNTS_FILE,
    'Stateful live pitch test requires INNOVEST_TEST_WRITE=1, API URL and two accounts.');
  const accounts = loadTestAccounts();
  const founderPage = await browser.newPage();
  const investorPage = await browser.newPage();
  const title = `E2E disposable standalone pitch ${Date.now()}`;
  const revisedTitle = `${title} revised`;
  let founder;
  let investor;
  let pitchId;
  try {
    founder = await signIn(founderPage, accounts.accountA);
    investor = await signIn(investorPage, accounts.accountB);
    await founderPage.goto('/fundraise-dashboard/create-pitch');
    await founderPage.getByLabel('Pitch title').fill(title);
    await founderPage.getByLabel('Country').selectOption('Bangladesh');
    await founderPage.getByLabel('Industry').selectOption('Education');
    await founderPage.getByLabel('The business').fill('Disposable educational software pitch for browser testing.');
    const creating = founderPage.waitForResponse((response) => response.url() === `${apiBase}/pitches` && response.request().method() === 'POST');
    await founderPage.getByRole('button', { name: 'Publish pitch' }).click();
    const created = await creating;
    expect(created.status()).toBe(201);
    pitchId = (await created.json()).id;
    expect(Number(pitchId)).toBeGreaterThan(0);

    await investorPage.goto(`/pitches/${pitchId}`);
    await expect(investorPage.getByText(title, { exact: true }).first()).toBeVisible();
    const forbiddenEdit = await request.put(`${apiBase}/pitches/users/${founder.id}/pitches/${pitchId}`, {
      headers: { Authorization: `Bearer ${investor.token}`, 'Content-Type': 'application/json' },
      data: { title: 'unauthorized' },
    });
    expect(forbiddenEdit.status()).toBe(403);
    const forbiddenDelete = await request.delete(`${apiBase}/pitches/users/${founder.id}/pitches/${pitchId}`, {
      headers: { Authorization: `Bearer ${investor.token}` },
    });
    expect(forbiddenDelete.status()).toBe(403);

    await founderPage.goto(`/fundraise-dashboard/edit-pitch/${pitchId}`);
    await expect(founderPage.getByLabel('Pitch title')).toHaveValue(title);
    await founderPage.getByLabel('Pitch title').fill(revisedTitle);
    await founderPage.getByRole('button', { name: 'Review changes' }).click();
    const updating = founderPage.waitForResponse((response) => response.url() === `${apiBase}/pitches/users/${founder.id}/pitches/${pitchId}` && response.request().method() === 'PUT');
    await founderPage.getByRole('dialog').getByRole('button', { name: 'Save changes' }).click();
    expect((await updating).status()).toBe(200);
    await investorPage.reload();
    await expect(investorPage.getByText(revisedTitle, { exact: true }).first()).toBeVisible();

    await founderPage.goto('/fundraise-dashboard');
    await expect(founderPage.getByRole('heading', { name: revisedTitle })).toBeVisible();
    await founderPage.getByRole('button', { name: `Delete ${revisedTitle}` }).click();
    const deleting = founderPage.waitForResponse((response) => response.url() === `${apiBase}/pitches/users/${founder.id}/pitches/${pitchId}` && response.request().method() === 'DELETE');
    await founderPage.getByRole('dialog').getByRole('button', { name: 'Delete pitch' }).click();
    expect((await deleting).status()).toBe(200);
    pitchId = undefined;
    await expect(founderPage.getByRole('heading', { name: revisedTitle })).toHaveCount(0);
    console.log('Live standalone pitch passed: create, public view, edit, delete and cross-account write denial.');
  } finally {
    if (pitchId && founder) {
      const cleanup = await request.delete(`${apiBase}/pitches/users/${founder.id}/pitches/${pitchId}`, {
        headers: { Authorization: `Bearer ${founder.token}` },
      });
      console.log(`Disposable pitch cleanup: ${cleanup.ok() ? 'deleted' : `failed (HTTP ${cleanup.status()})`}.`);
    }
    await founderPage.close();
    await investorPage.close();
  }
});
