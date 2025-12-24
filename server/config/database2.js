// Reuse the primary DB pool so all tables use the same database
require('dotenv').config();
const pool = require('./database');

(async () => {
  try {
    const [rows] = await pool.query('SELECT 1');
    console.log('✅ DB2 connected', rows);
  } catch (err) {
    console.error('❌ DB2 connection failed', err);
  }
})();

// Initialize database and tables
async function initializeDatabase() {
  const connection = await pool.getConnection();
  try {
    // Create POSTS and COMMENTS tables; reuse users from main DB
    await connection.query(`
      CREATE TABLE IF NOT EXISTS POSTS (
        post_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        authorName VARCHAR(255) default 'Anonymous',
        avatar VARCHAR(255) default '/default-avatar.png',
        numLikes INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS COMMENTS (
        comment_id INT AUTO_INCREMENT PRIMARY KEY,
        post_id INT NOT NULL,
        AUTHOR_NAME VARCHAR(255),
        avatar VARCHAR(255),
        user_id INT,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES POSTS(post_id) ON DELETE CASCADE
      );
    `);

    // Make schema updates idempotent for existing databases.
    // Use ALTER TABLE ... ADD COLUMN IF NOT EXISTS (works on MySQL 8+).
    const alterQueries = [
      "ALTER TABLE POSTS ADD COLUMN IF NOT EXISTS authorName VARCHAR(255) DEFAULT 'Anonymous'",
      "ALTER TABLE POSTS ADD COLUMN IF NOT EXISTS avatar VARCHAR(255) DEFAULT '/default-avatar.png'",
      "ALTER TABLE POSTS ADD COLUMN IF NOT EXISTS numLikes INT DEFAULT 0",
      "ALTER TABLE COMMENTS ADD COLUMN IF NOT EXISTS avatar VARCHAR(255)",
      "ALTER TABLE COMMENTS ADD COLUMN IF NOT EXISTS AUTHOR_NAME VARCHAR(255)"
    ];

    for (const q of alterQueries) {
      try {
        await connection.query(q);
      } catch (err) {
        // Some MySQL versions don't support IF NOT EXISTS for ADD COLUMN.
        // Ignore "Duplicate column" errors, warn on others.
        if (!/Duplicate column|already exists/i.test(err.message)) {
          console.warn('ALTER TABLE warning (ignored):', err.message);
        }
      }
    }

    // Ensure foreign key exists on COMMENTS.post_id -> POSTS.post_id.
    try {
      await connection.query(
        'ALTER TABLE COMMENTS ADD CONSTRAINT fk_comments_post FOREIGN KEY (post_id) REFERENCES POSTS(post_id) ON DELETE CASCADE'
      );
    } catch (err) {
      // Ignore errors about duplicate constraints or inability to add
      if (!/Duplicate key name|Cannot add foreign key constraint|errno: 121/i.test(err.message)) {
        console.warn('Foreign key creation warning (ignored):', err.message);
      }
    }

    // verification_codes index may belong to other DB initializer; try creating but ignore duplicates
    try {
      await connection.query('CREATE INDEX idx_verif_email ON verification_codes(email)');
    } catch (err) {
      if (!/Duplicate key name|already exists|no such table|doesn't exist/i.test(err.message)) {
        throw err;
      }
    }

    // Optional: remove unexpected tables (DANGEROUS) when explicitly enabled
    if (process.env.CLEAN_DB2 === 'true') {
      try {
        console.warn('CLEAN_DB2 is true — checking for unexpected tables to remove');

        const [rows] = await connection.query('SHOW TABLES');
        // Determine the column name that contains table names (Tables_in_<dbname>)
        const tableKey = Object.keys(rows[0] || {})[0];
        const existing = rows.map((r) => (r[tableKey] || '').toString().toLowerCase());

        const allowed = ['users', 'posts', 'comments'];

        for (const t of existing) {
          if (!allowed.includes(t)) {
            try {
              console.log(`Dropping unexpected table: ${t}`);
              await connection.query(`DROP TABLE IF EXISTS \`${t}\``);
            } catch (dropErr) {
              console.error(`Failed to drop table ${t}:`, dropErr.message);
            }
          }
        }
      } catch (cleanupErr) {
        console.error('Error during CLEAN_DB2 cleanup:', cleanupErr.message || cleanupErr);
      }
    }

    console.log(' Database tables initialized/updated');
  } catch (error) {
    console.error('Database initialization error:', error);
  } finally {
    connection.release();
  }
}
// Example query function

initializeDatabase().catch(console.error);

module.exports = pool;
