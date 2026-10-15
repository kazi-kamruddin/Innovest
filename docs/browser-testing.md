# Browser testing with two disposable Innovest accounts

The dated coverage record, fixes, and deployment verification limits are in [functional-audit.md](functional-audit.md).

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

Manual checks still needed: a fresh email verification link, a full password-reset email and old-session invalidation, the Google account chooser/linking flow, one actual EmailJS Help message, and a backup restore into a separate database. A live non-participant conversation check needs a third verified disposable account; the backend rule has a controller test.

## Additional access-control regressions

`e2e/protected-routes.spec.js` checks that all 25 member-only API route shapes reject a guest before reading or changing data. It can run while the database is unavailable because the authentication middleware rejects missing tokens first.

`e2e/response-pitch-privacy.spec.js` creates a disposable investor request and response pitch with the two accounts. It checks that the request owner can see the response, public pitch discovery and a guest detail request cannot, and the founder and request investor can open the details. It deletes the pitch and closes the request in a `finally` block. Run it only with `INNOVEST_TEST_WRITE=1`. This regression needs the backend access-control change deployed before it can pass on the live site.

On 13 October 2026, this test confirmed that the deployed `/pitches` endpoint included the disposable response pitch in its public list. The local fix excludes response pitches from public discovery and restricts their detail route to the founder and request investor. Backend unit tests cover both private response details and public standalone details; repeat the disposable browser regression after deploying both backend and frontend changes. The initial live suite run was interrupted while Aiven was powered off (`/ready` returned 503). After Aiven returned, the read-only browser suite passed 18 active checks and skipped 8 write-gated checks.

The live two-account checks on 13 October also passed messaging and notification read permissions, profile edit and restoration, the full investor response and status journey, request edit/close/reopen, standalone pitch create/edit/delete, and logout token revocation. The cleanup test found zero unfinished disposable pitches and zero open disposable requests. These checks exercise the currently deployed version; the response privacy regression remains intentionally failing there until the fix is deployed. The frontend's patched React Router version builds and passes local guest navigation, message loading, request loading, and Knock smoke checks. `npm audit --omit=dev` reports no frontend or backend production dependency advisories after the update.

The production backend accepts only the configured Vercel origin, so a locally served frontend cannot sign in against the live API. Run live account tests against the deployed frontend. Local browser checks use mocked API responses where needed. After deploying the privacy fix, rerun `e2e/response-pitch-privacy.spec.js` with `INNOVEST_TEST_WRITE=1` to verify the formerly exposed route returns no private response to a guest.

The privacy regression passed against the locally updated backend and frontend connected to Aiven on 13 October: public discovery excluded the new response, a guest received 404 for its detail, and the founder and request investor received 200. The browser rendered the founder's detail. The test deleted the response pitch and closed the disposable request.

## 15 October 2026 audit update

The original response privacy regression passed against the public frontend/API on 15 October, closing the older deployed response-exposure finding. The test was then expanded to check that response review omits the founder's login email and that its founder can open the private editor, save changes, and retain guest denial. These additions passed against the updated local frontend/backend connected to Aiven; deploy today's changes before expecting the expanded test to pass publicly.

New mocked checks are in `e2e/session-regressions.spec.js` (private editor authorization and cross-tab account/logout changes) and `e2e/notification-races.spec.js` (failed loads and a late poll after marking items read). They require `INNOVEST_TEST_API_URL` but use fake sessions and do not write real records. The default local suite passed 27 checks with 11 gated skips. All nine selected stateful journeys passed across the grouped run and corrected privacy-fixture rerun; the audit record describes the limits.

Each account is limited to 10 logins per IP in 15 minutes, and the IP has a 30-login limit. Split production runs across that window. Restarting a local backend resets its own in-memory limiter; do not restart production merely to bypass a test limit. The cleanup flag targets only labeled disposable records owned by the test accounts.
