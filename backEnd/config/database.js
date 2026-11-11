const mysql = require('mysql2/promise');
require('dotenv').config();
const { buildPoolConfig } = require('./poolConfig');

const pool = mysql.createPool(buildPoolConfig(process.env));

module.exports = pool;
