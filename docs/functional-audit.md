# Functional verification status — 13 October 2026

This is a coverage record, not a claim that every possible input or future service failure has been tested. The disposable accounts are `accountA` (founder) and `accountB` (investor); their credentials stay in the ignored file outside the repository described in `browser-testing.md`.

| Area | What was exercised | Current result |
| --- | --- | --- |
| Public site | All 13 public routes, mobile navigation, pitch and investor discovery, search and filters, empty results | Passed locally; production read-only suite passed 18 checks |
| Account boundaries | Invalid registration/login-related inputs, guest redirects, 25 member-only API route shapes, login, logout and token revocation | Passed; 32 backend tests pass |
| Email recovery | Forgot/reset UI success and validation states with mocked requests; token consumption and old-token revocation in backend tests | Code paths pass; actual mailbox delivery needs manual check |
| Google sign-in | Production button, backend token verification, account creation and linking unit tests | Provider chooser and real account linking need manual check |
| Profiles | Two-account profile edit and restoration, public profile without login email, investor preference validation/save/public read/restoration, cross-account write denial | Passed; investor preferences tested with the local updated app and Aiven |
| Pitches | Standalone create/view/edit/delete, cross-account write denial, request response creation and visibility | Core journeys pass; production **fails** response-pitch privacy until the backend fix is deployed |
| Investor requests | Create, list, search/category/sort, edit, close, reopen, closed-response rejection, owner-only response status transitions | Passed with two accounts |
| Messaging | Conversation start, Knock, real-time exchange, reload persistence, notification delivery, guest denial, malformed socket actions, non-participant controller checks | Passed; live third-account non-participant check remains unrun |
| Notifications | Single read, owner check, bulk read and account isolation | Passed; bulk read tested with local updated app and Aiven |
| Help form | Success and failure UI with EmailJS intercepted | Actual delivery needs manual check |
| Operations | Render `/ready`, Aiven connection, production dependency audit, frontend build, lint | Ready and builds; Aiven may power off independently; backup restore needs a separate manual drill |

## Production blocker

The deployed API still returns a newly submitted private response pitch from public `GET /pitches`, and guest `GET /pitches/:id` returns 200. The test cleaned up its pitch and closed the request. The fix in this checkout excludes response pitches from public discovery and limits detail access to the founder and request investor. `e2e/response-pitch-privacy.spec.js` passes against this updated frontend and backend connected to Aiven. Deploy both applications, then rerun the same regression against the public URLs before calling production verified.

## Test execution limits

The live read-only suite passed 18 checks and skipped record-changing tests. On the updated local app, 22 read-only checks passed in the grouped run; the only failure was malformed-input validation returning 503 when optional providers were absent. After correcting validation order, the affected check passed, so all 23 active read-only checks have passed. Six stateful two-account journeys and the response privacy regression passed against the updated local app in separate runs. Investor preferences, notification bulk read, and socket validation passed separately. Cleanup found no unfinished disposable pitches or open requests. Closed test requests, notifications, and labeled test messages remain because the app has no deletion flow for those records.

The backend limits login attempts to 10 per IP and email per 15 minutes. Running every stateful file after the read-only suite can reach HTTP 429; that happened once before any records were created by the last test. Split the runs across rate-limit windows. A 429 from the test runner is not a feature failure.

## Checks requiring an operator or third account

1. Complete a **fresh** signup, receive the Brevo verification email, verify, and confirm the link cannot be reused.
2. Request a real reset email, set a new password, and confirm the old password and an existing session no longer work.
3. Use the Google chooser for both a new account and an existing account linking with its password.
4. Send one authorized Help form message and confirm it arrives through EmailJS. The automated test intercepts delivery.
5. Restore a backup into a separate database and compare table counts; never restore over the live database as a test.
6. For a literal live three-person permission check, add a third verified disposable account and confirm it cannot read or send in the two existing accounts' conversation. The backend non-participant condition is covered by a controller test meanwhile.

These are the remaining verification boundaries. No test suite can prove every possible failure mode, but each major product journey and backend access-control boundary now has a stated check and result.
