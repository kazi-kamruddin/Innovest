import { expect, test } from '@playwright/test';

test('guest can reach public account pages and is redirected from private pages', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Welcome back.' })).toBeVisible();

  await page.goto('/signup');
  await expect(page.getByRole('heading', { name: 'Create your account.' })).toBeVisible();

  for (const path of ['/profile', '/profile/edit-profile', '/profile/investor-info', '/messages', '/notifications']) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/login(?:[?#]|$)/);
  }
});

test.describe('Google sign-in availability', () => {
  test.skip(process.env.INNOVEST_EXPECT_GOOGLE !== '1', 'Set INNOVEST_EXPECT_GOOGLE=1 to check the deployed Google button.');
  test('production login displays the Google sign-in button', async ({ page }) => {
    await page.goto('/login');
    const googleButton = page.getByLabel('Sign in with Google');
    await expect(googleButton).toBeVisible();
    await expect(googleButton.locator('iframe')).toBeVisible();
  });
});
