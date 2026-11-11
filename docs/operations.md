# Operations

## Database and TLS configuration

Innovest connects to MySQL 8-compatible databases via [`backEnd/config/poolConfig.js`](../backEnd/config/poolConfig.js) (`mysql2/promise` pool, `connectionLimit: 10`, `queueLimit: 500`, `connectTimeout: 10000`, `enableKeepAlive: true`).

SSL/TLS options resolve in strict priority order:
1. `DB_SSL_CA` — inline PEM certificate text (`\n` literals expanded). Use on hosts where mounting cert files is impractical.
2. `DB_SSL_CA_PATH` — path resolved relative to `backEnd/` (for example `./certs/isrgrootx1.pem` or `./certs/ca.pem` locally).
3. `DB_SSL_ENABLED=true` — system-CA TLS (`{ minVersion: 'TLSv1.2', rejectUnauthorized: true }`) without bundled `.pem` files. **Use this on Render Docker for TiDB Cloud Starter**, because `backEnd/.dockerignore` excludes `certs/` and `**/*.pem` from container images.

## Schema migrations and showcase seeding

All migration and seed scripts run from `backEnd/` and keep database credentials out of Git:

- **Idempotent full schema migration (`npm run migrate:all`):**
  - Inspect offline first: `npm run migrate:all -- --dry-run` verifies `000_baseline_schema.sql`, `002_account_security.sql`, `003_responses_notifications.sql`, and `004_google_identity.sql` contain only `CREATE TABLE IF NOT EXISTS` statements and exclude legacy `001_upgrade_2025_dump.sql`.
  - Apply to `DB_NAME`: `npm run migrate:all` checks `SELECT DATABASE() === DB_NAME`, applies all four migration files in order, and verifies all 13 tables (`SELECT 1 FROM <table> LIMIT 1`).
  - Individual incremental runners (`002_account_security.sql`, `npm run migrate:responses`, `npm run migrate:google`) remain available when upgrading a pre-migration legacy schema.
- **Showcase demo seeder (`npm run seed:demo`):**
  - Default dry-run (`npm run seed:demo`) validates all showcase entities offline without opening a database connection.
  - Run `npm run seed:demo -- --apply` to atomically upsert the 6 showcase accounts (`@demo.innovest.local`), 6 user & investor profiles, 7 requests (6 open, 1 closed), 10 public marketplace pitches, 3 private response pitches (`interested`, `under_review`, `submitted`), 2 conversations with 4 messages, and matching notifications.
  - Set `SEED_DEMO_PASSWORD` in your shell before `--apply` when you want deterministic login passwords for those `@demo.innovest.local` accounts. If omitted, new inserts receive a cryptographic random password and updates keep existing hashes unchanged (no password literals exist in the repository).
  - Optional `--prune-test-data`: deletes `users` rows whose lowercase email is not in the `@demo.innovest.local` set or `SEED_KEEP_EMAILS` (comma-separated allowlist). Always inspect with `npm run seed:demo -- --prune-test-data` (dry-run) before combining with `--apply`.

## Account security rollout

1. Export a verified database backup outside the repository before applying schema changes.
2. Ensure all 13 schema tables exist (`npm run migrate:all` for fresh/managed databases, or `002_account_security.sql` followed by `migrate:responses` and `migrate:google` on legacy schemas). Legacy accounts without an `auth_account_state` row continue to sign in.
3. Deploy compatible backend and frontend versions together.
4. To enable email verification and password recovery via Brevo: register and verify a sender address in Brevo, create an API key, and set `BREVO_API_KEY`, `AUTH_EMAIL_FROM`, `ACCOUNT_EMAIL_ENABLED=true`, and exact `FRONTEND_URL` on Render, then redeploy.
5. Verify registration, verification link consumption, login, password reset, and old-token rejection using a real test inbox.

Do not place `BREVO_API_KEY` or DB/JWT secrets in Vercel variables, `VITE_` variables, or frontend code. Access tokens are stored in browser `localStorage`; logout revokes the active token (`auth_revoked_tokens`), password reset bumps `token_version`, and `server.js` prunes expired `auth_revoked_tokens` and `auth_action_tokens` rows at startup and every 6 hours. Login and registration rate limits live in Render process memory and reset on instance restart.

## Service checks and Render free-tier wakeups

- **Probes:** Render uses `/health` (HTTP process liveness). Monitor `/ready` externally (`GET /ready` runs `SELECT 1 ... LIMIT 1` with a 3s timeout on all 6 additive security/workflow/identity tables and returns `503` if unavailable).
- **Smoke / Wake script (`npm run smoke` / `npm run wake`):** Both commands run `backEnd/scripts/smoke.mjs`, verifying `/health`, `/ready`, `/pitches`, and the Vercel frontend `/`, retrying transient cold-start `502`/`503`/`504` responses and timeouts (`90s` request timeout, up to 4 retries). Override `BACKEND_URL` and `FRONTEND_URL` in your shell when targeting another environment.
- **GitHub Actions cadence:** `.github/workflows/production-smoke.yml` runs on `cron: '15 8 */3 * *'` (every 3 days) and `workflow_dispatch`, avoiding twice-daily cold wakes against Render's 750 free instance-hours/month quota.
- **Pre-demo warmup:** When the Vercel frontend mounts, `App.jsx` sends a silent, non-blocking `GET <VITE_API_URL>/health` request to start waking a sleeping Render container early. Before live interviews or demos, run `npm run wake` from `backEnd/` (or dispatch `Production smoke check` in GitHub Actions) 2–3 minutes ahead of time until `OK /ready` prints.

## TiDB Cloud Starter cutover sequence

1. Archive the legacy Aiven database outside Git using the backup drill command below.
2. Provision a **TiDB Cloud Starter** cluster (`gateway01...tidbcloud.com`, port `4000`) and create database `innovest` (`utf8mb4` / `utf8mb4_unicode_ci`).
3. Point local `backEnd/.env` to TiDB (`DB_HOST`, `DB_PORT=4000`, `DB_USER`, `DB_PASS`, `DB_NAME=innovest`, `DB_SSL_ENABLED=true`, and optional `DB_SSL_CA_PATH=./certs/isrgrootx1.pem`).
4. From `backEnd/`, run `npm run migrate:all` followed by `SEED_DEMO_PASSWORD='<your-demo-password>' npm run seed:demo -- --apply` (PowerShell: set `$env:SEED_DEMO_PASSWORD=...` first, then run `npm run seed:demo -- --apply`).
5. Start backend and frontend locally, confirm `GET /ready` returns `200`, and inspect `/pitches`, `/investor-list`, `/investor-request`, and `/messages`.
6. Merge `dev` -> `main` and push so Vercel and Render deploy matching revisions.
7. Update Render environment variables (`DB_HOST`, `DB_PORT=4000`, `DB_USER`, `DB_PASS`, `DB_NAME=innovest`, `DB_SSL_ENABLED=true`, removing stale Aiven `DB_SSL_CA` / `DB_SSL_CA_PATH` overrides if using system TLS).
8. Trigger a Render redeploy and run `npm run wake` from `backEnd/` to confirm `/health`, `/ready`, `/pitches`, and Vercel `/` all pass.

## Database backup and restore drill

Keep backups and PEM certificates strictly outside Git tracking. With MySQL 8 command-line tools installed (on Windows typically `"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe"`), avoid PowerShell `<` redirection and use `--result-file`:

```powershell
$backupFile = 'E:\Backups\innovest-backup.sql'
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe" `
  "--host=$($env:DB_HOST)" "--port=$($env:DB_PORT)" "--user=$($env:DB_USER)" `
  --password --ssl-mode=VERIFY_CA "--ssl-ca=$($env:DB_SSL_CA_PATH)" `
  --single-transaction --set-gtid-purged=OFF --no-tablespaces `
  --column-statistics=0 --hex-blob "--result-file=$backupFile" "$($env:DB_NAME)"
```

`--password` prompts interactively so credentials do not remain in process arguments or history. Confirm non-zero file size and `-- Dump completed` footer, retain dated copies, and verify recoverability only into a separate empty database — **never** test-restore over a live database. Keep an offline copy of Render and Vercel environment variables alongside DB backups.
