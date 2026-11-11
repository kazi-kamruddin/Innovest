const fs = require('node:fs');
const path = require('node:path');

const isTruthy = (value) => ['true', '1', 'yes'].includes(String(value || '').trim().toLowerCase());

const resolveSslOptions = (env = process.env, { rootDir = path.resolve(__dirname, '..'), fsImpl = fs } = {}) => {
  const inlineCa = typeof env.DB_SSL_CA === 'string' && env.DB_SSL_CA.trim()
    ? env.DB_SSL_CA.replace(/\\n/g, '\n')
    : null;
  if (inlineCa) {
    return { ca: inlineCa, minVersion: 'TLSv1.2', rejectUnauthorized: true };
  }

  const caPath = typeof env.DB_SSL_CA_PATH === 'string' && env.DB_SSL_CA_PATH.trim()
    ? path.resolve(rootDir, env.DB_SSL_CA_PATH.trim())
    : null;
  if (caPath && fsImpl.existsSync(caPath)) {
    return { ca: fsImpl.readFileSync(caPath, 'utf8'), minVersion: 'TLSv1.2', rejectUnauthorized: true };
  }

  if (isTruthy(env.DB_SSL_ENABLED)) {
    return { minVersion: 'TLSv1.2', rejectUnauthorized: true };
  }

  return null;
};

const buildPoolConfig = (env = process.env, deps = {}) => {
  const parsedPort = env.DB_PORT !== undefined && String(env.DB_PORT).trim() !== ''
    ? Number(env.DB_PORT)
    : undefined;
  const ssl = resolveSslOptions(env, deps);

  return {
    host: env.DB_HOST,
    port: Number.isFinite(parsedPort) ? parsedPort : env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASS,
    database: env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 500,
    connectTimeout: 10000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    ...(ssl ? { ssl } : {}),
  };
};

module.exports = { buildPoolConfig, resolveSslOptions };
