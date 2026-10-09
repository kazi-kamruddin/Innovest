const mysql = require('mysql2/promise');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

const ca = process.env.DB_SSL_CA
  ? process.env.DB_SSL_CA.replace(/\\n/g, '\n')
  : process.env.DB_SSL_CA_PATH
    ? fs.readFileSync(path.resolve(__dirname, '..', process.env.DB_SSL_CA_PATH), 'utf8')
    : null;

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ...(ca ? { ssl: { ca } } : {})
});

module.exports = pool;
