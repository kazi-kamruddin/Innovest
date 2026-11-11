# Innovest backend

The backend runs as a Node.js web service and connects to a hosted MySQL 8 / TiDB Cloud Starter database (`mysql2/promise`). Its Docker image contains the application and production npm dependencies (`backEnd/.dockerignore` excludes `certs/` and `**/*.pem`), so database credentials and TLS configuration are supplied at runtime.

## Build and run locally

From the repository root:

```powershell
docker build -t innovest-backend ./backEnd
docker run --rm -p 4000:4000 --env-file ./backEnd/.env -e PORT=4000 -e DB_SSL_ENABLED=true innovest-backend
```

If your MySQL host requires a custom CA file locally instead of system root certificates (for example Aiven MySQL), mount the file read-only at runtime:

```powershell
docker run --rm -p 4000:4000 --env-file ./backEnd/.env -e PORT=4000 -e DB_SSL_CA_PATH=/run/secrets/db-ca.pem --mount "type=bind,source=C:\path\to\ca.pem,target=/run/secrets/db-ca.pem,readonly" innovest-backend
```

The local `.env` must contain `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`, `SECRET`, and `FRONTEND_URL`. Never commit `.env` or `*.pem` certificates.

## Database setup, migrations, and demo data

From `backEnd/`:

```bash
npm run migrate:all -- --dry-run   # Inspect 000..004 DDL statements offline
npm run migrate:all                # Apply baseline + additive tables and verify all 13 tables
npm run seed:demo                  # Dry-run validate curated showcase dataset
npm run seed:demo -- --apply       # Transactional idempotent upsert of demo dataset
```

See [operations](../docs/operations.md) for `SEED_DEMO_PASSWORD`, `--prune-test-data`, and cutover instructions.

## Deploy on Render

Create a Web Service linked to the GitHub repository with these settings:

| Setting | Value |
| --- | --- |
| Branch | `main` |
| Root directory | `backEnd` |
| Language | Docker |
| Dockerfile path | `./Dockerfile` |

Render builds the image from the Dockerfile and starts it with its `CMD`. The server reads Render's `PORT` automatically:

- Set `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`, `SECRET`, and `FRONTEND_URL` (`https://innovest-site.vercel.app`, no trailing slash) as Render environment variables.
- For **TiDB Cloud Starter**, set `DB_SSL_ENABLED=true` (uses container system root CAs; remove stale `DB_SSL_CA` / `DB_SSL_CA_PATH` overrides). For providers requiring a private CA, set `DB_SSL_CA` to the full PEM string (`BEGIN`/`END` lines included) — never set `DB_SSL_CA_PATH` to a Windows workstation path.
- Health & readiness: Render's health check path is `/health`; external uptime monitoring and `npm run wake` verify `/ready` (all 6 additive tables + MySQL ping).
- Optional email flows: set `BREVO_API_KEY`, `AUTH_EMAIL_FROM`, and `ACCOUNT_EMAIL_ENABLED=true` after all 13 schema tables exist.

The Dockerfile does not start MySQL; the database runs externally on TiDB Cloud Starter (or Aiven MySQL) and Vercel builds the frontend separately. See [operations](../docs/operations.md) for smoke checks, free-tier wakeups, and backups.
