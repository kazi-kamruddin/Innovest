import { expect, test } from '@playwright/test';

test('recovery forms handle errors without sending an email', async ({ page }) => {
  const api = process.env.INNOVEST_TEST_API_URL?.replace(/\/+$/, '');
  test.skip(!api, 'Set INNOVEST_TEST_API_URL.');
  await page.route(`${api}/user/forgot-password`, (route) => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ message: 'If this address has an account, a reset link will be sent.' }),
  }));
  await page.goto('/forgot-password');
  await page.getByLabel('Email address').fill('disposable@example.com');
  await page.getByRole('button', { name: 'Send reset link' }).click();
  await expect(page.getByRole('status')).toContainText('If this address has an account');

  await page.goto('/reset-password#token=abc');
  await page.getByLabel('New password').fill('long-password-123');
  await page.getByLabel('Confirm password').fill('different-password-123');
  await page.getByRole('button', { name: 'Update password' }).click();
  await expect(page.getByRole('alert')).toContainText('Passwords do not match');
});

test('help form reports success and failure without contacting EmailJS', async ({ page }) => {
  let status = 200;
  let intercepted = 0;
  await page.route('**/api/v1.0/email/send-form', (route) => {
    intercepted += 1;
    return route.fulfill({ status, contentType: 'text/plain', body: status === 200 ? 'OK' : 'Error' });
  });
  await page.goto('/help');
  async function fillForm() {
    await page.getByLabel('Your name').fill('Disposable tester');
    await page.getByLabel('Email address').fill('disposable@example.com');
    await page.getByLabel('Your message').fill('Test message.');
  }
  await fillForm();
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByRole('heading', { name: 'Message sent successfully.' })).toBeVisible();
  await page.getByRole('button', { name: 'Send another message' }).click();
  status = 500;
  await fillForm();
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByRole('alert')).toContainText("Your message couldn't be sent");
  expect(intercepted).toBe(2);
});
