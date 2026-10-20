# Functional verification status

**Review date:** 15 October 2026. **Latest application testing:** 15 October 2026. Reviewed `dev` at `c643f5f` plus the uncommitted audit changes described below. Results apply to their named environments, without implying every possible input or failure mode was tested.

## 15 October 2026 audit

| Area | Fix and verification |
| --- | --- |
| Private response editor | Sends the session token when loading a private response; clears its redirect timer on unmount. A mocked regression failed before the fix and passes now. The real two-account response test also opens, edits, and saves a private response locally. |
| Session isolation | New JWTs have unique IDs so same-second logins do not share revocation state. Account changes and logout propagate between tabs, remounting pages to clear private caches. Token collision was reproduced; backend and two-tab regressions pass. |
| Socket sessions | Sockets disconnect at token expiry and revalidate authorization before incoming packets. Real Socket.IO tests cover expiry and revocation on an established connection. |
| Notifications | Superseded/unmounted loads are aborted; a late poll cannot undo a successful mark-read operation. A failed load no longer shows an empty-inbox success message. Two mocked regressions and real single/bulk read checks pass. |
| Validation and privacy | Text types and column limits, TEXT byte limits, funding overflow, and numeric route IDs are validated before SQL. Response reviews omit the founder's login email. An empty investor directory returns HTTP 200 and an empty array. Backend controller/HTTP regressions pass; column types and DECIMAL(15,2) limits were checked using metadata without reading personal records. |
| Database failure/resource handling | Failed rollback no longer escapes the API error handler; connections are released before account email delivery or follow-up notification pool queries. Failure/resource regressions pass. |
| Request consistency | Response creation locks the request and saves in one transaction, serializing with closure. Commit and closed-request rollback tests pass, as do the real response and closed-request journeys locally. No concurrent live stress test was run. |
| Layout resilience | Local sizing rules preserve intended widths if the external stylesheet fails. Removed a redundant Bootstrap alpha link with an unusable integrity value. The 390px mobile test failed before the fallback and passes now across guest/member pages. Colors and component arrangement were preserved. |

### Results and limits

- **Local backend:** 42 tests pass, including HTTP and real Socket.IO regressions. The final run includes funding overflow, failed rollback handling, and connection release before email/notification work.
- **Production dependencies:** backend and frontend audits each report zero vulnerabilities.
- **Local frontend:** build passes; lint has 0 errors and 15 existing Fast Refresh warnings. The build still reports a bundle over 500 kB.
- **Local app connected to Aiven:** the default Playwright run passed **27** checks and skipped **11** gated checks. Eight stateful journeys passed in one batch; the expanded response privacy/edit journey passed separately after correcting its API fixture to include the country required by the editor. Together these cover all nine selected journeys: response/status workflow, request lifecycle, standalone pitch CRUD, profile edit/restore, preferences/restore, messaging, logout, notification bulk read, and private response editing. These do not verify today's changes on the public deployment.
- **Production:** smoke passed `/health`, `/ready`, and the website. The original privacy regression passed on the public frontend/API: no response in public discovery, guest detail 404, permitted parties 200. This run preceded the new editor and login-email assertions; those were verified locally. Today's new fixes were not deployed by this audit, and no exact deployed revision was established.
- **Cleanup:** no unfinished disposable pitches or open disposable requests were found. Privacy tests deleted their responses and closed their requests. Profiles/preferences were restored. Closed test requests, notifications, and labeled messages remain because no corresponding deletion flow exists.

The initial expanded privacy/edit test failed because its fixture omitted the editor's required country. The corrected fixture passed; the response wait is now paired with the save click to avoid an unhandled timeout. Local test batches used a local backend restart between groups to avoid accumulated login limits; production limits were not changed.

Deploy today's compatible backend/frontend changes, then repeat the expanded privacy/edit regression on the public origins. The operator checks at the end of this file remain outstanding. The 15 October production privacy pass supersedes the older exposure finding below.

## Historical verification — 13 October 2026

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

### Historical production blocker — resolved by the 15 October public-origin privacy check

On 13 October the deployed API returned a newly submitted private response pitch from public `GET /pitches`, and guest `GET /pitches/:id` returned 200. The test cleaned up its pitch and closed the request. The source fix excluded response pitches from public discovery and limited details to their founder and request investor; its local regression passed that day. The public-origin pass on 15 October closed this finding. Today's additional audit changes still need their own deployed verification.

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
