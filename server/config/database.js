const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

// Use the Service URI from Aiven (DATABASE_URL) or individual vars for local dev
const connectionConfig = process.env.DATABASE_URL || {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
};

// Build pool options and honor SSL envs (DB_SSL, DB_CA, DB_CA_PATH) or DATABASE_URL
const baseOptions = typeof connectionConfig === 'string' ? { uri: connectionConfig } : { ...connectionConfig };

if (process.env.DB_SSL === 'true') {
  let ca;
  if (process.env.DB_CA_PATH && fs.existsSync(process.env.DB_CA_PATH)) {
    ca = fs.readFileSync(process.env.DB_CA_PATH);
  } else if (process.env.DB_CA) {
    ca = Buffer.from(process.env.DB_CA, 'base64');
  }

  baseOptions.ssl = ca ? { ca } : { rejectUnauthorized: true };
}

const pool = mysql.createPool({
  ...baseOptions,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Initialize database and tables
async function initializeDatabase() {
  const connection = await pool.getConnection();
  try {
    // Create users table
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

    // Create verification codes table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS verification_codes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        code VARCHAR(6) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NOT NULL,
        FOREIGN KEY (email) REFERENCES users(email) ON DELETE CASCADE
      );
    `);

    console.log('✓ Database tables initialized');
  } catch (error) {
    console.error('Database initialization error:', error);
  } finally {
    connection.release();
  }
}

// Call this on server startup
initializeDatabase().catch(console.error);

module.exports = pool;
