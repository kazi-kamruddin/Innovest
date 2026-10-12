import { expect, test } from '@playwright/test';

test('every member-only API route rejects a guest before reading or changing data', async ({ request }) => {
  test.skip(!process.env.INNOVEST_TEST_API_URL, 'Set INNOVEST_TEST_API_URL.');
  const api = process.env.INNOVEST_TEST_API_URL.replace(/\/+$/, '');
  const routes = [
    ['POST', '/user/logout'],
    ['GET', '/pitches/users/1/pitches'],
    ['POST', '/pitches'],
    ['POST', '/pitches/in-response/1'],
    ['PUT', '/pitches/users/1/pitches/1'],
    ['DELETE', '/pitches/users/1/pitches/1'],
    ['POST', '/profile/1/edit-profile'],
    ['POST', '/investor-info'],
    ['GET', '/investor-info/1'],
    ['GET', '/investor-request'],
    ['GET', '/investor-request/my-closed'],
    ['GET', '/investor-request/1'],
    ['GET', '/investor-request/1/pitches'],
    ['POST', '/investor-request/create-new-request'],
    ['PUT', '/investor-request/edit-request/1'],
    ['PUT', '/investor-request/1/close'],
    ['PUT', '/investor-request/1/reopen'],
    ['PATCH', '/investor-request/1/pitches/1/status'],
    ['GET', '/conversations'],
    ['POST', '/conversations/start'],
    ['GET', '/conversations/1/messages'],
    ['POST', '/conversations/1/messages'],
    ['GET', '/notifications'],
    ['PATCH', '/notifications/read-all'],
    ['PATCH', '/notifications/1/read'],
  ];

  for (const [method, path] of routes) {
    const response = await request.fetch(`${api}${path}`, {
      method,
      ...(method === 'GET' || method === 'DELETE' ? {} : { data: {} }),
    });
    expect(response.status(), `${method} ${path} must require a session`).toBe(401);
  }
});
