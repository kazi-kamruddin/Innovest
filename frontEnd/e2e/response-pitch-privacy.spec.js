import { expect, test } from '@playwright/test';
import { loadTestAccounts } from './accounts.js';

test('request responses stay out of public pitch discovery and detail routes', async ({ request, browser }) => {
  test.skip(process.env.INNOVEST_TEST_WRITE !== '1' || !process.env.INNOVEST_TEST_API_URL ||
    !process.env.INNOVEST_TEST_ACCOUNTS_FILE || !process.env.INNOVEST_TEST_SITE_URL,
  'Set INNOVEST_TEST_WRITE=1, API URL, site URL and two accounts for this disposable privacy test.');

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
  const founderHeaders = { Authorization: `Bearer ${founder.token}` };
  const investorHeaders = { Authorization: `Bearer ${investor.token}` };
  let requestId;
  let pitchId;
  let founderContext;

  try {
    const createdRequest = await request.post(`${api}/investor-request/create-new-request`, {
      headers: investorHeaders,
      data: {
        investorId: investor.user.id,
        title: `E2E disposable privacy request ${Date.now()}`,
        description: 'Disposable request used to test response visibility.',
        category: 'Education',
      },
    });
    expect(createdRequest.status()).toBe(201);
    requestId = (await createdRequest.json()).id;

    const createdPitch = await request.post(`${api}/pitches/in-response/${requestId}`, {
      headers: founderHeaders,
      data: { title: `E2E disposable private response ${Date.now()}`, industry: 'Education' },
    });
    expect(createdPitch.status()).toBe(201);
    pitchId = (await createdPitch.json()).id;

    const ownerList = await request.get(`${api}/investor-request/${requestId}/pitches`, { headers: investorHeaders });
    expect(ownerList.status()).toBe(200);
    expect((await ownerList.json()).some((pitch) => pitch.id === pitchId)).toBe(true);

    const publicList = await request.get(`${api}/pitches`);
    expect(publicList.status()).toBe(200);
    expect.soft((await publicList.json()).some((pitch) => pitch.id === pitchId),
      'A private response must not appear in public pitch discovery').toBe(false);

    const guestDetail = await request.get(`${api}/pitches/${pitchId}`);
    expect.soft(guestDetail.status(), 'Guests must not open a private response pitch').toBe(404);
    for (const headers of [founderHeaders, investorHeaders]) {
      const detail = await request.get(`${api}/pitches/${pitchId}`, { headers });
      expect(detail.status()).toBe(200);
    }

    founderContext = await browser.newContext();
    await founderContext.addInitScript(({ token, user }) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }, founder);
    const founderPage = await founderContext.newPage();
    await founderPage.goto(`/pitches/${pitchId}`);
    await expect(founderPage.getByText(`E2E disposable private response`, { exact: false }).first()).toBeVisible();
  } finally {
    await founderContext?.close();
    if (pitchId) {
      const removed = await request.delete(`${api}/pitches/users/${founder.user.id}/pitches/${pitchId}`, {
        headers: founderHeaders,
      });
      expect(removed.ok(), 'Disposable response pitch cleanup').toBe(true);
    }
    if (requestId) {
      const closed = await request.put(`${api}/investor-request/${requestId}/close`, {
        headers: investorHeaders,
      });
      expect(closed.ok(), 'Disposable request cleanup').toBe(true);
    }
  }
});
