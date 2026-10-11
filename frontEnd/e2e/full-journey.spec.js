import { expect, test } from '@playwright/test';
import { loadTestAccounts } from './accounts.js';

const apiBase = process.env.INNOVEST_TEST_API_URL?.replace(/\/+$/, '');

async function signIn(page, account) {
  await page.goto('/login');
  await page.getByLabel('Email address').fill(account.email);
  await page.getByLabel('Password', { exact: true }).fill(account.password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect.poll(() => page.evaluate(() => Boolean(localStorage.getItem('token'))), { timeout: 90_000 }).toBe(true);
  return page.evaluate(() => ({
    id: JSON.parse(localStorage.getItem('user')).id,
    token: localStorage.getItem('token'),
  }));
}

function auth(session) {
  return { Authorization: `Bearer ${session.token}` };
}

test('two-account investor request journey on the deployed site', async ({ browser, request }) => {
  test.skip(process.env.INNOVEST_TEST_WRITE !== '1' || !apiBase || !process.env.INNOVEST_TEST_ACCOUNTS_FILE,
    'Set INNOVEST_TEST_WRITE=1, INNOVEST_TEST_API_URL and INNOVEST_TEST_ACCOUNTS_FILE for this stateful live test.');

  const accounts = loadTestAccounts();
  const investorPage = await browser.newPage();
  const founderPage = await browser.newPage();
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const requestTitle = `E2E disposable education request ${suffix}`;
  const pitchTitle = `E2E disposable education pitch ${suffix}`;
  let investor;
  let founder;
  let requestId;
  let pitchId;
  const steps = [];

  try {
    investor = await signIn(investorPage, accounts.accountB);
    founder = await signIn(founderPage, accounts.accountA);
    steps.push('both accounts sign in');

    const profile = await request.get(`${apiBase}/investor-info/${investor.id}`, { headers: auth(investor) });
    expect([200, 404]).toContain(profile.status());
    if (profile.status() === 404) {
      await investorPage.goto('/profile/investor-info');
      await investorPage.getByLabel('Minimum investment *').fill('1000');
      await investorPage.getByLabel('Maximum investment *').fill('10000');
      const saved = investorPage.waitForResponse((response) => response.url() === `${apiBase}/investor-info` && response.request().method() === 'POST');
      await investorPage.getByRole('button', { name: 'Save preferences' }).click();
      expect((await saved).status()).toBe(201);
    }
    steps.push('investor profile saved');

    await investorPage.goto('/investor-request/create-new-request');
    await investorPage.getByLabel('Request title').fill(requestTitle);
    await investorPage.getByLabel('Investment category').selectOption('Education');
    await investorPage.getByLabel('Description').fill('Disposable browser test: seeking an education startup with a practical learning tool.');
    await investorPage.getByLabel('Minimum investment (USD)').fill('1000');
    await investorPage.getByLabel('Maximum investment (USD)').fill('10000');
    await investorPage.getByRole('button', { name: 'Review request' }).click();
    const created = investorPage.waitForResponse((response) => response.url() === `${apiBase}/investor-request/create-new-request` && response.request().method() === 'POST');
    await investorPage.getByRole('button', { name: 'Publish request' }).click();
    const createdResponse = await created;
    expect(createdResponse.status()).toBe(201);
    requestId = (await createdResponse.json()).id;
    expect(Number(requestId)).toBeGreaterThan(0);
    steps.push('investor request published');

    await founderPage.goto('/investor-request');
    await expect(founderPage.getByText(requestTitle, { exact: true })).toBeVisible();
    await founderPage.goto(`/investor-request/create-response-pitch/${requestId}`);
    await expect(founderPage.getByText(requestTitle, { exact: true })).toBeVisible();
    await founderPage.getByLabel('Pitch title').fill(pitchTitle);
    await founderPage.getByLabel('Country').selectOption('Bangladesh');
    await founderPage.getByLabel('Industry').selectOption('Education');
    await founderPage.getByLabel('The business').fill('Disposable browser test pitch for a learning tool.');
    const submitted = founderPage.waitForResponse((response) => response.url() === `${apiBase}/pitches/in-response/${requestId}` && response.request().method() === 'POST');
    await founderPage.getByRole('button', { name: 'Submit response pitch' }).click();
    const submittedResponse = await submitted;
    expect(submittedResponse.status()).toBe(201);
    pitchId = (await submittedResponse.json()).id;
    expect(Number(pitchId)).toBeGreaterThan(0);
    steps.push('founder response pitch submitted');

    const forbidden = await request.get(`${apiBase}/investor-request/${requestId}/pitches`, { headers: auth(founder) });
    expect(forbidden.status()).toBe(403);
    await investorPage.goto(`/investor-request/${requestId}/response-pitches`);
    await expect(investorPage.getByRole('heading', { name: pitchTitle })).toBeVisible();
    await investorPage.getByLabel('Response status').selectOption('under_review');
    await expect.poll(async () => {
      const response = await request.get(`${apiBase}/investor-request/${requestId}/pitches`, { headers: auth(investor) });
      if (response.status() !== 200) return null;
      const pitch = (await response.json()).find((item) => Number(item.id) === Number(pitchId));
      return pitch?.response_status;
    }).toBe('under_review');
    const forbiddenStatus = await request.patch(`${apiBase}/investor-request/${requestId}/pitches/${pitchId}/status`, {
      headers: { ...auth(founder), 'Content-Type': 'application/json' },
      data: { status: 'interested' },
    });
    expect(forbiddenStatus.status()).toBe(403);
    for (const status of ['interested', 'declined']) {
      await investorPage.getByLabel('Response status').selectOption(status);
      await expect.poll(async () => {
        const response = await request.get(`${apiBase}/investor-request/${requestId}/pitches`, { headers: auth(investor) });
        return (await response.json()).find((item) => Number(item.id) === Number(pitchId))?.response_status;
      }).toBe(status);
    }
    await founderPage.goto('/fundraise-dashboard');
    await expect(founderPage.getByRole('heading', { name: pitchTitle })).toBeVisible();
    await expect(founderPage.getByText('Investor response: Declined')).toBeVisible();
    steps.push('response visibility, ownership and all status transitions');

    await investorPage.goto('/notifications');
    await expect(investorPage.getByText('A new pitch was submitted to your investor request.').first()).toBeVisible();
    const investorNotifications = await request.get(`${apiBase}/notifications`, { headers: auth(investor) });
    expect((await investorNotifications.json()).items.some((item) =>
      item.kind === 'pitch_response' && item.target_path === `/investor-request/${requestId}/response-pitches`)).toBe(true);
    await founderPage.goto('/notifications');
    await expect(founderPage.getByText(/under review/i).first()).toBeVisible();
    steps.push('notifications delivered to both users');

    console.log(`Live investor journey passed: ${steps.join('; ')}.`);
  } finally {
    if (requestId && investor) {
      const closed = await request.put(`${apiBase}/investor-request/${requestId}/close`, { headers: auth(investor) });
      console.log(`Disposable request cleanup: ${closed.ok() ? 'closed' : `failed (HTTP ${closed.status()})`}.`);
    }
    if (pitchId && founder) {
      const removed = await request.delete(`${apiBase}/pitches/users/${founder.id}/pitches/${pitchId}`, { headers: auth(founder) });
      console.log(`Disposable pitch cleanup: ${removed.ok() ? 'deleted' : `failed (HTTP ${removed.status()})`}.`);
    }
    await investorPage.close();
    await founderPage.close();
  }
});
