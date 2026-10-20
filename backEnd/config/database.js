const mysql = require('mysql2/promise');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

const caPath = process.env.DB_SSL_CA_PATH ? path.resolve(__dirname, '..', process.env.DB_SSL_CA_PATH) : null;
const ca = process.env.DB_SSL_CA
  ? process.env.DB_SSL_CA.replace(/\\n/g, '\n')
  : caPath && fs.existsSync(caPath)
    ? fs.readFileSync(caPath, 'utf8')
    : null;

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 500,
  connectTimeout: 10000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  ...(ca ? { ssl: { ca } } : {})
});

module.exports = pool;
