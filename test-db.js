console.log("Starting...");
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false, // Disable SSL to test TCP connection
  connectionTimeoutMillis: 10000
});
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error("Connection failed:", err);
  } else {
    console.log("Connection success:", res.rows[0]);
  }
  pool.end();
});
