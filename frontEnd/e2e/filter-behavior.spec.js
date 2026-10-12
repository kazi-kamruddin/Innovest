import { expect, test } from '@playwright/test';
import { loadTestAccounts } from './accounts.js';

test('pitch filters send criteria and combine with text search', async ({ page }) => {
  const api = process.env.INNOVEST_TEST_API_URL?.replace(/\/+$/, '');
  test.skip(!api, 'Set INNOVEST_TEST_API_URL.');
  const all = [
    { id: 900001, user_id: 1001, title: 'E2E Education Alpha', industry: 'Education', stage: 'Idea', country: 'Bangladesh' },
    { id: 900002, user_id: 1002, title: 'E2E Healthcare Beta', industry: 'Healthcare', stage: 'Scaling', country: 'India' },
  ];
  const seen = [];
  await page.route((url) => url.href.startsWith(`${api}/pitches?`), (route) => {
    const params = new URL(route.request().url()).searchParams;
    seen.push(Object.fromEntries(params));
    const rows = all.filter((pitch) => ['industry', 'stage', 'country'].every((key) =>
      !params.get(key) || pitch[key] === params.get(key)));
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(rows) });
  });

  await page.goto('/pitches');
  await expect(page.getByText('E2E Education Alpha').first()).toBeVisible();
  await expect(page.getByText('E2E Healthcare Beta').first()).toBeVisible();
  await page.getByLabel('Industry').selectOption('Education');
  await expect(page.getByText('E2E Healthcare Beta')).toHaveCount(0);
  await page.getByLabel('Stage').selectOption('Idea');
  await page.getByRole('combobox', { name: 'Country' }).selectOption('Bangladesh');
  await expect(page.getByText('E2E Education Alpha').first()).toBeVisible();
  expect(seen.some((item) => item.industry === 'Education' && item.stage === 'Idea' && item.country === 'Bangladesh')).toBe(true);
  await page.getByPlaceholder('Search by pitch title or country...').fill('no such pitch');
  await expect(page.getByRole('heading', { name: 'No matching opportunities' })).toBeVisible();
  await page.getByRole('button', { name: /Clear all filters/i }).first().click();
  await expect(page.getByText('E2E Healthcare Beta').first()).toBeVisible();
});

test('investor requests switch owner tabs and apply search, category and sort', async ({ browser, request }) => {
  const api = process.env.INNOVEST_TEST_API_URL?.replace(/\/+$/, '');
  test.skip(!api || !process.env.INNOVEST_TEST_ACCOUNTS_FILE, 'Set API URL and the two-account file.');
  const login = await request.post(`${api}/user/login`, { data: loadTestAccounts().accountB });
  expect(login.status()).toBe(200);
  const session = await login.json();
  const context = await browser.newContext();
  await context.addInitScript(({ token, user }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }, session);
  try {
    const page = await context.newPage();
    await page.route(`${api}/investor-info/${session.user.id}`, (route) => route.fulfill({
      status: 200, contentType: 'application/json', body: JSON.stringify({ user_id: session.user.id }),
    }));
    await page.route(`${api}/investor-request`, (route) => route.fulfill({
      status: 200, contentType: 'application/json', body: JSON.stringify([
        { id: 900011, investorId: session.user.id, title: 'E2E own technology', description: 'Own request', category: 'Technology', status: 'open', minInvestment: 100, maxInvestment: 1000, createdAt: '2026-10-01T00:00:00Z' },
        { id: 900012, investorId: session.user.id + 100, title: 'E2E other education', description: 'Other request', category: 'Education', status: 'open', minInvestment: 100, maxInvestment: 500, createdAt: '2026-10-03T00:00:00Z' },
        { id: 900013, investorId: session.user.id + 101, title: 'E2E other health', description: 'Another request', category: 'Healthcare', status: 'open', minInvestment: 200, maxInvestment: 900, createdAt: '2026-10-02T00:00:00Z' },
      ]),
    }));
    await page.goto('/investor-request');
    await expect(page.getByRole('heading', { name: 'E2E own technology' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'E2E other education' })).toHaveCount(0);
    await page.getByRole('button', { name: /Other investors/ }).click();
    await expect(page.getByRole('heading', { name: 'E2E other education' })).toBeVisible();
    await page.getByLabel('Filter by category').selectOption('Education');
    await expect(page.getByRole('heading', { name: 'E2E other health' })).toHaveCount(0);
    await page.getByPlaceholder('Search requests...').fill('no result');
    await expect(page.getByRole('heading', { name: 'No matching requests' })).toBeVisible();
    await page.getByRole('button', { name: 'Clear filters' }).first().click();
    await page.getByLabel('Sort investor requests').selectOption('oldest');
    const titles = await page.locator('.iv-ir-card-grid h3').allTextContents();
    expect(titles).toEqual(['E2E other health', 'E2E other education']);
  } finally {
    await context.close();
  }
});
