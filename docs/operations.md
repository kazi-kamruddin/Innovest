# Operations

## Google sign-in rollout

1. Apply `backEnd/database/004_google_identity.sql` to Aiven before deploying this backend version. From `backEnd/`, run `npm run migrate:google` using the existing `.env` connection. The command can be rerun safely. The `/ready` endpoint checks the new table.
2. In Google Cloud Console, create or select a project, complete **Google Auth Platform → Branding**, set **Audience** to External for public users, and create a **Web application** OAuth client in **Clients**. In **Authorized JavaScript origins**, add `http://localhost:5173` and the exact production Vercel origin, such as `https://innovest-site.vercel.app`. Use origins only: no trailing slash or path. This integration uses a browser callback, so it does not need an Authorized redirect URI.
3. Copy the **client ID** to Render as `GOOGLE_CLIENT_ID` and to Vercel as `VITE_GOOGLE_CLIENT_ID` for Production. For local testing, set the same value in `backEnd/.env` and `frontEnd/.env.local`. Do not use the client secret. Redeploy both services after changing their environment variables; Vercel embeds `VITE_` variables at build time.
4. Test three journeys: a new Google account, a returning Google account, and an existing email/password account. The existing account must enter its password once to link Google. After linking, test a password reset: it revokes sessions and removes the Google link, requiring a fresh password-confirmed link.

Google's `sub` claim identifies linked users; email is used only to find an existing account during the first link. The backend verifies Google's signed ID token for the configured web client ID. The browser never sends a Google client secret to Innovest. If the Google button is absent, check `VITE_GOOGLE_CLIENT_ID`; if it appears but sign-in fails, check that Render uses the same client ID and that the frontend origin is authorized in Google Console.

## Response statuses and notifications rollout

1. From `backEnd/`, run `npm run migrate:responses` with the existing Aiven connection configured in `backEnd/.env`. The command applies `database/003_responses_notifications.sql`, verifies both tables, and can be rerun safely. Do this before deploying this backend version.
2. Merge the reviewed code to `main` and allow Render and Vercel to deploy. Render's `/ready` endpoint checks both new tables, so it returns 503 until the migration is applied.
3. Test with two accounts: an entrepreneur submits a pitch to an investor request; the investor sees it in Responses, changes its status, and the entrepreneur sees that status on the Fundraise dashboard. Send a message in each direction and confirm the recipient sees it in Notifications.

Notifications are stored in Aiven and delivered live through Socket.IO when the recipient is connected. The browser also refreshes the unread count every 30 seconds. They are in-app only; Brevo remains dedicated to account verification and password recovery.

## Account security rollout

1. Confirm Aiven shows a recent backup. This migration only creates three new tables; an independent SQL export is optional for this change.
2. Apply `backEnd/database/002_account_security.sql` to the Aiven database before deploying backend code that uses it. The migration adds three tables. Accounts created before this change have no `auth_account_state` row and can continue to sign in.
3. Deploy the backend and frontend changes together. Login and protected routes require the new tables even while account email is disabled.
4. Create a free Brevo account, register an email address you control as a sender, and verify it with Brevo's emailed code. A Gmail address can be used without buying a domain; Brevo temporarily replaces its From address with a Brevo domain for delivery. Create a Brevo API key. On Render, set `BREVO_API_KEY`, `AUTH_EMAIL_FROM` to the verified sender address, and `ACCOUNT_EMAIL_ENABLED=true`. Keep `FRONTEND_URL` set to the public Vercel origin. Redeploy Render after setting them.
5. Create a new account using an email address you control, follow the verification link, sign in, request a password reset, and confirm the old password and old JWT no longer work.

Do not place the API key in Vercel variables, `VITE_` variables, the repository, or frontend code. If account email remains disabled, existing sign-in and signup work, but verification and password recovery are unavailable. Brevo's free plan currently allows 300 emails per day; monitor delivery and its quota. The replacement sender may look unfamiliar to recipients, so ask early testers to check spam.

Current access tokens are still held in browser local storage. Logout revokes the token presented by that browser and password reset invalidates earlier tokens for the account. Moving tokens into HTTP-only cookies requires a coordinated browser/API origin change and should be a separate deployment. Login rate limits are held in the Render process, so they reset when the free instance restarts.

## Service checks

- Render's health check remains `/health`. It shows that the HTTP process is responding.
- `/ready` checks the Aiven connection and the account schema. It returns HTTP 503 when the database or migration is unavailable. Use it for an external uptime monitor that can alert you.
- From `backEnd/`, run `npm run smoke` to check the public API and site after deployment. Override `BACKEND_URL` and `FRONTEND_URL` in your shell when testing another deployment.
- The `production-smoke.yml` GitHub Actions workflow runs this check twice daily and can also be started manually. It becomes active after you add it to the default branch; review failed runs in GitHub Actions.
- Review Render logs when `/ready` fails or an account email cannot be delivered. The API logs provider failures without logging reset links or tokens.

## Database backup and restore drill

Keep backups outside the Git repository. With MySQL command-line tools installed, set `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_NAME`, and `DB_SSL_CA_PATH` in your PowerShell session, then run:

```powershell
$backupFile = 'C:\Backups\innovest-backup.sql'
mysqldump --host=$env:DB_HOST --port=$env:DB_PORT --user=$env:DB_USER --password --ssl-mode=VERIFY_CA --ssl-ca=$env:DB_SSL_CA_PATH --single-transaction --routines --triggers --result-file=$backupFile $env:DB_NAME
```

`--password` prompts for the password so it does not appear in the command line. Check that the file has a reasonable size and retain multiple dated copies. To prove that a backup works, create a separate empty MySQL database, import this file into it with MySQL Workbench, and inspect the table counts. Do not run a restore into the live Aiven database as a test.

Before a destructive schema change, export a fresh SQL backup. A database backup does not include Render or Vercel environment variables; keep a separate secure record of their names and values.
