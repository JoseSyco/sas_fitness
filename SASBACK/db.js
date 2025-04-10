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

// Create connection pool with database specified
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'sas2',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Function to get a connection from the pool
async function getConnection() {
  try {
    return await pool.getConnection();
  } catch (error) {
    console.error('Error getting database connection:', error);
    throw error;
  }
}

module.exports = {
  query: async (text, params) => await pool.query(text, params),
  pool,
  getConnection
};
