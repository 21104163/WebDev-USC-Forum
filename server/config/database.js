const mysql = require('mysql2/promise');
require('dotenv').config();

// Use DATABASE_URL (optional) OR individual vars
const connectionConfig = process.env.DATABASE_URL || {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
};

// Build base options
const baseOptions =
  typeof connectionConfig === 'string'
    ? { uri: connectionConfig }
    : { ...connectionConfig };

// // ✅ Aiven requires SSL — always enable in production
// baseOptions.ssl = { rejectUnauthorized: false };

const pool = mysql.createPool({
  ...baseOptions,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Initialize database and tables
async function initializeDatabase() {
  const connection = await pool.getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        email_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);


    await connection.query(`
      CREATE TABLE IF NOT EXISTS verification_codes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        code VARCHAR(6) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NOT NULL
      );
    `);

    try {
      await connection.query('CREATE INDEX idx_verif_email ON verification_codes(email)');
    } catch (err) {
      if (!/Duplicate key name|already exists/i.test(err.message)) {
        throw err;
      }
    }

    console.log('✓ Database tables initialized');
  } catch (error) {
    console.error('Database initialization error:', error);
  } finally {
    connection.release();
  }
}

initializeDatabase().catch(console.error);

module.exports = pool;
