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

test('investor can edit, close and reopen a request while founder cannot modify it', async ({ browser, request }) => {
  test.skip(process.env.INNOVEST_TEST_WRITE !== '1' || !apiBase || !process.env.INNOVEST_TEST_ACCOUNTS_FILE,
    'Stateful request lifecycle test requires INNOVEST_TEST_WRITE=1, API URL and two accounts.');
  const accounts = loadTestAccounts();
  const investorPage = await browser.newPage();
  const founderPage = await browser.newPage();
  const title = `E2E disposable lifecycle request ${Date.now()}`;
  const revised = `${title} revised`;
  let investor;
  let founder;
  let requestId;
  try {
    investor = await signIn(investorPage, accounts.accountB);
    founder = await signIn(founderPage, accounts.accountA);
    await investorPage.goto('/investor-request/create-new-request');
    await investorPage.getByLabel('Request title').fill(title);
    await investorPage.getByLabel('Investment category').selectOption('Technology');
    await investorPage.getByLabel('Description').fill('Disposable lifecycle request to verify edit, close, and reopen.');
    await investorPage.getByRole('button', { name: 'Review request' }).click();
    const creating = investorPage.waitForResponse((response) => response.url() === `${apiBase}/investor-request/create-new-request` && response.request().method() === 'POST');
    await investorPage.getByRole('button', { name: 'Publish request' }).click();
    const created = await creating;
    expect(created.status()).toBe(201);
    requestId = (await created.json()).id;

    const forbiddenEdit = await request.put(`${apiBase}/investor-request/edit-request/${requestId}`, {
      headers: { Authorization: `Bearer ${founder.token}`, 'Content-Type': 'application/json' },
      data: { title: 'unauthorized', description: 'unauthorized', category: 'Technology' },
    });
    expect(forbiddenEdit.status()).toBe(403);
    const forbiddenClose = await request.put(`${apiBase}/investor-request/${requestId}/close`, {
      headers: { Authorization: `Bearer ${founder.token}` },
    });
    expect([403, 404]).toContain(forbiddenClose.status());

    await investorPage.goto(`/investor-request/edit-request/${requestId}`);
    await expect(investorPage.getByLabel('Request title')).toHaveValue(title);
    await investorPage.getByLabel('Request title').fill(revised);
    await investorPage.getByRole('button', { name: 'Review changes' }).click();
    const updating = investorPage.waitForResponse((response) => response.url() === `${apiBase}/investor-request/edit-request/${requestId}` && response.request().method() === 'PUT');
    await investorPage.getByRole('dialog').getByRole('button', { name: /save changes/i }).click();
    expect((await updating).status()).toBe(200);

    await investorPage.goto('/investor-request');
    await expect(investorPage.getByRole('heading', { name: revised })).toBeVisible();
    await investorPage.getByRole('button', { name: `Close request: ${revised}` }).click();
    const closing = investorPage.waitForResponse((response) => response.url() === `${apiBase}/investor-request/${requestId}/close` && response.request().method() === 'PUT');
    await investorPage.getByRole('dialog').getByRole('button', { name: /close request/i }).click();
    expect((await closing).status()).toBe(200);
    const closed = await request.get(`${apiBase}/investor-request/${requestId}`, { headers: { Authorization: `Bearer ${investor.token}` } });
    expect((await closed.json()).status).toBe('closed');

    const closedResponse = await request.post(`${apiBase}/pitches/in-response/${requestId}`, {
      headers: { Authorization: `Bearer ${founder.token}`, 'Content-Type': 'application/json' },
      data: { title: 'E2E rejected closed request pitch', country: 'Bangladesh', industry: 'Technology' },
    });
    expect(closedResponse.status()).toBe(400);

    await investorPage.goto('/investor-request/my-closed-requests');
    await expect(investorPage.getByRole('heading', { name: revised })).toBeVisible();
    await investorPage.getByRole('button', { name: /Reopen request/i }).first().click();
    const reopening = investorPage.waitForResponse((response) => response.url() === `${apiBase}/investor-request/${requestId}/reopen` && response.request().method() === 'PUT');
    await investorPage.getByRole('dialog').getByRole('button', { name: /reopen request/i }).click();
    expect((await reopening).status()).toBe(200);
    const open = await request.get(`${apiBase}/investor-request/${requestId}`, { headers: { Authorization: `Bearer ${investor.token}` } });
    expect((await open.json()).status).toBe('open');
    console.log('Live request lifecycle passed: edit, close, closed-response rejection, reopen, and cross-account write denial.');
  } finally {
    if (requestId && investor) {
      const cleanup = await request.put(`${apiBase}/investor-request/${requestId}/close`, {
        headers: { Authorization: `Bearer ${investor.token}` },
      });
      console.log(`Disposable request cleanup: ${cleanup.ok() ? 'closed' : `failed (HTTP ${cleanup.status()})`}.`);
    }
    await investorPage.close();
    await founderPage.close();
  }
});
