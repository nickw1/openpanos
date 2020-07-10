const { Pool } = require('pg');

// Replace with your DB connection details
const pool = new Pool({
    user: 'gisuser',
    host: 'localhost',
    database: 'otv' });

module.exports = pool;
