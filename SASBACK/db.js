const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Log database connection parameters for debugging
console.log('Database connection parameters:', {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD ? '******' : '',
  database: process.env.DB_NAME || 'sas2'
});

// Create connection pool without specifying database initially
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = {
  query: async (text, params) => await pool.query(text, params),
  pool
};
