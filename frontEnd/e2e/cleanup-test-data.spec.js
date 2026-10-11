import { expect, test } from '@playwright/test';
import { loadTestAccounts } from './accounts.js';

test('remove unfinished disposable test pitches and close unfinished requests', async ({ request }) => {
  test.skip(process.env.INNOVEST_TEST_CLEANUP !== '1' || !process.env.INNOVEST_TEST_API_URL ||
    !process.env.INNOVEST_TEST_ACCOUNTS_FILE, 'Run only with INNOVEST_TEST_CLEANUP=1.');
  const api = process.env.INNOVEST_TEST_API_URL.replace(/\/+$/, '');
  const accounts = loadTestAccounts();
  const sessions = {};
  for (const name of ['accountA', 'accountB']) {
    const response = await request.post(`${api}/user/login`, { data: accounts[name] });
    expect(response.status()).toBe(200);
    sessions[name] = await response.json();
  }
  const founder = sessions.accountA;
  const investor = sessions.accountB;
  const pitches = await request.get(`${api}/pitches/users/${founder.user.id}/pitches`, {
    headers: { Authorization: `Bearer ${founder.token}` },
  });
  expect(pitches.status()).toBe(200);
  let deleted = 0;
  for (const pitch of await pitches.json()) {
    if (!/^E2E disposable (standalone|education) pitch \d/.test(pitch.title || '')) continue;
    const response = await request.delete(`${api}/pitches/users/${founder.user.id}/pitches/${pitch.id}`, {
      headers: { Authorization: `Bearer ${founder.token}` },
    });
    expect(response.status()).toBe(200);
    deleted++;
  }
  const requests = await request.get(`${api}/investor-request`, {
    headers: { Authorization: `Bearer ${investor.token}` },
  });
  expect(requests.status()).toBe(200);
  let closed = 0;
  for (const item of await requests.json()) {
    if (Number(item.investorId) !== Number(investor.user.id) ||
        !/^E2E disposable (education|lifecycle) request \d/.test(item.title || '')) continue;
    const response = await request.put(`${api}/investor-request/${item.id}/close`, {
      headers: { Authorization: `Bearer ${investor.token}` },
    });
    expect(response.status()).toBe(200);
    closed++;
  }
  console.log(`Disposable cleanup: ${deleted} unfinished pitch(es) deleted; ${closed} unfinished request(s) closed.`);
});
