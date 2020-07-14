const { Pool } = require('pg');

// Replace with your DB connection details
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DBASE });

module.exports = pool;
