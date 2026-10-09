# Innovest backend

The backend runs as a Node.js web service and connects to the separately hosted Aiven MySQL database. Its Docker image contains the application and production npm dependencies. Database credentials and the Aiven CA certificate are supplied at runtime.

## Build and run locally

From the repository root:

```powershell
docker build -t innovest-backend ./backEnd
docker run --rm -p 4000:4000 --env-file ./backEnd/.env -e PORT=4000 -e DB_SSL_CA_PATH=/run/secrets/aiven-ca.pem --mount "type=bind,source=C:\path\to\ca.pem,target=/run/secrets/aiven-ca.pem,readonly" innovest-backend
```

Replace the certificate source path with your downloaded Aiven CA certificate. The mount makes it readable inside the container without copying it into the image. The local `.env` must contain the database settings, `SECRET`, and `FRONTEND_URL`; its Windows `DB_SSL_CA_PATH` is overridden by the container path above. Visit `http://localhost:4000/pitches` to check the database-backed API.

## Deploy on Render

Create a Web Service linked to the GitHub repository with these settings:

| Setting | Value |
| --- | --- |
| Branch | `main` |
| Root directory | `backEnd` |
| Language | Docker |
| Dockerfile path | `./Dockerfile` |

Render builds the image from the Dockerfile and starts it with its `CMD`. The server reads Render's `PORT` automatically. Set `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`, `SECRET`, and `FRONTEND_URL` as Render environment variables. Set `DB_SSL_CA` to the full PEM contents of the Aiven CA certificate, including the BEGIN and END lines; do not set `DB_SSL_CA_PATH` to a path on your computer. Set `FRONTEND_URL` to the final Vercel production origin (for example, `https://innovest.vercel.app`) without a trailing slash. Never commit the `.env` file, certificate, or credentials.

The Dockerfile does not include or start MySQL. Aiven remains the database service, and Vercel builds the frontend separately.
