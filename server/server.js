const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Initialize database
require('./config/database');
const db2 = require('./config/database2');

const app = express();

const allowedOrigins = [
  'https://web-dev-usc-forum.vercel.app',
  'http://localhost:5173'
];

// CORS middleware (ONLY ONCE)
app.use(cors({
  origin: (origin, callback) => {
    // Log origin for debugging CORS issues
    console.log('CORS request origin:', origin);

    // allow Postman / curl (no origin)
    if (!origin) return callback(null, true);

    // allow everything when debugging flag set
    if (process.env.ALLOW_ALL_ORIGINS === 'true') return callback(null, true);

      // allow exact configured origins
      if (allowedOrigins.includes(origin)) return callback(null, true);

      // allow Vercel preview deployments (they use <name>.vercel.app)
      try {
        if (typeof origin === 'string' && origin.endsWith('.vercel.app')) return callback(null, true);
      } catch (e) {
        // ignore
      }

    return callback(new Error('CORS blocked: ' + origin));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('/*splat', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));

// Basic route
app.get('/', (req, res) => res.json({ message: 'USC Forum API running' }));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  // Ensure CORS headers are present even on errors so browser can read response
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  }
  res.status(500).json({ message: 'Internal server error' });
});

app.get('/tables', async (req, res) => {
  try {
    const [tables] = await db2.query('SHOW TABLES');
    res.json(tables);
  } catch (err) {
  console.error('DB query error:', err);
  res.status(500).json({
    error: err.message || JSON.stringify(err)
  });
}
});
app.get('/posts', async (req, res) => {
  try {
    const [posts] = await db2.query('SELECT * FROM POSTS');
    res.json(posts);
  } catch (err) {
  console.error('DB query error:', err);
  res.status(500).json({
    error: err.message || JSON.stringify(err)
  });
}
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✓ API running on http://localhost:${PORT}`));

// --- User migration from DB1 to DB2 ---
(async function migrateUsers() {
  try {
    console.log(' Starting user migration from DB1 to DB2');

    // Step 1: fetch all users from DB1
    const db1 = require('./config/database');      
    const db2 = require('./config/database2');     
    const [users] = await db1.query('SELECT * FROM users');
    console.log(`Found ${users.length} users in DB1`);

    // Step 2: insert users into DB2
    for (const user of users) {
      await db2.query(
        `INSERT INTO users (id, email, password, email_verified, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           email = VALUES(email),
           password = VALUES(password),
           email_verified = VALUES(email_verified),
           created_at = VALUES(created_at),
           updated_at = VALUES(updated_at)`,
        [
          user.id,
          user.email,
          user.password,
          user.email_verified,
          user.created_at,
          user.updated_at
        ]
      );
    }

    console.log('✅ Users migrated to DB2 successfully');
  } catch (err) {
    console.error('❌ User migration failed:', err);
  }
})();

