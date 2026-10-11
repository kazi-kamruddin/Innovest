import { expect, test } from '@playwright/test';

test.skip(/^https?:\/\//.test(process.env.INNOVEST_TEST_SITE_URL || ''),
  'These assertions cover local frontend error-copy changes and will apply to production after deployment.');

test('login distinguishes a server failure from invalid credentials', async ({ page }) => {
  await page.route('**/user/login', (route) => route.fulfill({
    status: 500,
    contentType: 'application/json',
    body: JSON.stringify({ error: 'Internal server error' }),
  }));
  await page.goto('/login');
  await page.getByLabel('Email address').fill('test+innovest-a@example.com');
  await page.getByLabel('Password', { exact: true }).fill('example-password-123');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveText('Sign in is temporarily unavailable. Please try again shortly.');
});

test('signup explains a server failure without submitting a real account', async ({ page }) => {
  await page.route('**/user/register', (route) => route.fulfill({
    status: 500,
    contentType: 'application/json',
    body: JSON.stringify({ error: 'Signup failed' }),
  }));
  await page.goto('/signup');
  await page.getByLabel('Full name').fill('Test Founder');
  await page.getByLabel('Email address').fill('test+innovest-a@example.com');
  await page.getByLabel('Password', { exact: true }).fill('example-password-123');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByRole('alert')).toHaveText('Account creation is temporarily unavailable. Please try again shortly.');
});
