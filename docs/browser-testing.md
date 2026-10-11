# Browser testing with two disposable Innovest accounts

The default Playwright checks use two verified accounts without changing live records. They cover API readiness, invalid account input, guest redirects, both account logins, private pages, investor and pitch discovery, mobile navigation and width, API ownership for pitch lists, and whether the Google button renders. Record-changing tests require an explicit write flag. Google account authorization is not automated.

## Prepare the accounts

Use two Gmail aliases that arrive in an inbox you control, for example `youraddress+innovest-a@gmail.com` and `youraddress+innovest-b@gmail.com`. Register each on Innovest, open each Brevo verification message, and finish email verification. Use a different password for each. Treat `accountA` as the entrepreneur and `accountB` as the investor. The stateful investor test creates accountB's investor profile if it is missing. Do not paste passwords into chat.

Keep the JSON file **outside the repository**. On this workstation, open it with:

```powershell
notepad 'E:\coding projects\CSE3100 project\Innovest-test-accounts.json'
```

Fill the file with your own aliases and passwords:

```json
{
  "accountA": { "email": "youraddress+innovest-a@gmail.com", "password": "" },
  "accountB": { "email": "youraddress+innovest-b@gmail.com", "password": "" }
}
```

The test loader rejects an in-repository file, empty passwords, and duplicate addresses. Test traces, screenshots, and video are disabled so credentials are not saved in Playwright artifacts. A repository ignore rule also covers `*test-accounts*.json` as a fallback.

## Run against the live site

From `frontEnd/`, in the same PowerShell window:

```powershell
$env:INNOVEST_TEST_ACCOUNTS_FILE = 'E:\coding projects\CSE3100 project\Innovest-test-accounts.json'
$env:INNOVEST_TEST_SITE_URL = 'https://innovest-site.vercel.app'
$env:INNOVEST_TEST_API_URL = 'https://innovest-awuh.onrender.com'
$env:INNOVEST_EXPECT_GOOGLE = '1'
npm ci
npx playwright install chromium
npm run test:e2e
```

The browser download is a one-time step. If Chromium is already installed for this Playwright version, the install command reuses it. To run only guest checks before filling the JSON file, omit `INNOVEST_TEST_ACCOUNTS_FILE` and run `npm run test:e2e -- e2e/guest.spec.js`.

If `/ready` fails with HTTP 503, stop before retrying registration. In Render Logs, find the `Readiness check failed:` line from the time you opened `/ready` and the `Signup failed:` line from the signup attempt. Those server logs identify the failing database connection or table. Do not share passwords, verification links, tokens, or Brevo keys.

After testing, remove the variables from that PowerShell session if desired:

```powershell
Remove-Item Env:INNOVEST_TEST_ACCOUNTS_FILE, Env:INNOVEST_TEST_SITE_URL, Env:INNOVEST_TEST_API_URL, Env:INNOVEST_EXPECT_GOOGLE -ErrorAction SilentlyContinue
```

The default live suite does not create or edit records. The mocked authentication-error and loading tests now also run against the deployed frontend: Playwright intercepts their API calls to reproduce delayed or failed responses without changing live records. Investor requests cannot currently be deleted through the app.

## Opt-in two-person journeys

The record-changing tests were run against the deployed site on 11 October 2026. To repeat them deliberately, set the same account, site, and API variables above, then run:

```powershell
$env:INNOVEST_TEST_WRITE = '1'
npm run test:e2e -- e2e/full-journey.spec.js e2e/request-lifecycle.spec.js e2e/pitch-crud.spec.js e2e/profile-edit.spec.js e2e/messaging.spec.js e2e/logout.spec.js
```

The investor test:

1. Creates an investor profile for accountB if needed, then publishes a labeled disposable request.
2. Submits a response pitch from accountA and checks that only accountB can read request responses.
3. Changes the response through Under review, Interested, and Declined; checks the founder dashboard and both users' notifications.
4. Closes the request and deletes the response pitch. The closed request and notifications remain as test data.

The request lifecycle test edits, closes, reopens, and finally closes another disposable request. It verifies non-owner writes and responses to a closed request are denied. The standalone pitch test creates, views, edits, and deletes a pitch, including non-owner write checks. The profile test edits accountA's details, checks public visibility, and restores the original values. The logout test revokes one Playwright session and signs in again.

The messaging test opens the two accounts' conversation through the API, sends two labeled messages while both browsers are open, checks live delivery and persistence, verifies a notification can be marked read only by its owner, and denies guest message access. Those private messages and the conversation remain as test data because there is no deletion endpoint. The Knock button now starts conversations through the same API; both its mocked regression and a real deployed button click passed after redeployment.

After an interrupted run, close or delete only unfinished records with the exact E2E disposable prefixes owned by these test accounts:

```powershell
$env:INNOVEST_TEST_CLEANUP = '1'
npm run test:e2e -- e2e/cleanup-test-data.spec.js
```

The frontend has mocked regressions for delayed request status, delayed message history, Knock, and authentication server errors. They passed against the redeployed site on 11 October 2026. Run them with the live site and API variables above using `npm run test:e2e -- e2e/request-loading.spec.js e2e/message-loading.spec.js e2e/knock-flow.spec.js e2e/auth-errors.spec.js`. `e2e/production-regressions.spec.js` clicks the real deployed Knock button and checks that the public member profile omits the login email; both checks passed. The full set of six record-changing journeys also passed after redeployment, and cleanup found no unfinished disposable pitches or open requests.

Manual checks still needed: a fresh email verification link, a full password-reset email and old-session invalidation, and the Google account chooser/linking flow. These require access to the mailbox or Google account. A database backup restore drill requires a separate database and operator access.
