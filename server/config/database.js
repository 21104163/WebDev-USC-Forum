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

// Prepare pool options so we can optionally enable SSL for Aiven or other managed DBs.
const poolOptions = { ...baseOptions };
if (process.env.AIVEN === 'true' || process.env.DB_REQUIRE_SSL === 'true' || process.env.NODE_ENV === 'production') {
  // Only set `ssl` when using object config; for URI configs, many platforms
  // accept `?ssl=true` or similar in the URL. This is a best-effort toggle.
  if (typeof poolOptions === 'object') {
    poolOptions.ssl = poolOptions.ssl || { rejectUnauthorized: false };
  }
}

const pool = mysql.createPool({
  ...poolOptions,
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

      await connection.query(`
      CREATE TABLE IF NOT EXISTS POSTS (
        post_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        authorName VARCHAR(255),
        avatar VARCHAR(255),
        numLikes INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_posts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS COMMENTS (
        comment_id INT AUTO_INCREMENT PRIMARY KEY,
        post_id INT NOT NULL,
        AUTHOR_NAME VARCHAR(255),
        avatar VARCHAR(255),
        user_id INT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES POSTS(post_id) ON DELETE CASCADE
      );
    `);

    // Password history table: used to prevent reuse of recent passwords
    await connection.query(`
      CREATE TABLE IF NOT EXISTS password_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (user_id),
        CONSTRAINT fk_password_history_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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
