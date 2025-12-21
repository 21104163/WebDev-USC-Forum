const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// ✅ Single database connection (Aiven MySQL)
const db = require('./config/database');

const app = express();

const allowedOrigins = [
  'https://web-dev-usc-forum.vercel.app',
  'http://localhost:5173'
];

// ✅ CORS (ONLY ONCE)
app.use(cors({
  origin: (origin, callback) => {
    console.log('CORS request origin:', origin);

    // Allow Postman / curl
    if (!origin) return callback(null, true);

    // Debug override
    if (process.env.ALLOW_ALL_ORIGINS === 'true') {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow Vercel previews
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    return callback(new Error('CORS blocked: ' + origin));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (process.env.ALLOW_ALL_ORIGINS === 'true') return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    return callback(new Error('CORS blocked'));
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'USC Forum API running' });
});

// Debug: show tables
app.get('/tables', async (req, res) => {
  try {
    const [tables] = await db.query('SHOW TABLES');
    res.json(tables);
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get posts
app.get('/posts', async (req, res) => {
  try {
    const [posts] = await db.query('SELECT * FROM POSTS');
    res.json(posts);
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Compatibility endpoint used by frontend example code (with pagination)
app.get('/select/posts', async (req, res) => {
  try {
    // pagination
    const limitRaw = parseInt(req.query.limit, 10);
    const offsetRaw = parseInt(req.query.offset, 10);
    const limit = Number.isInteger(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 50) : 10;
    const offset = Number.isInteger(offsetRaw) && offsetRaw >= 0 ? offsetRaw : 0;

    const [posts] = await db.query('SELECT * FROM POSTS ORDER BY created_at DESC LIMIT ? OFFSET ?', [limit, offset]);
    const [[{ total }]] = await db.query('SELECT COUNT(*) AS total FROM POSTS');
    res.json({ posts, total, limit, offset });
  } catch (err) {
    console.error('DB error (select/posts):', err);
    res.status(500).json({ error: err.message });
  }
});

// Get single post
app.get('/posts/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await db.query('SELECT * FROM POSTS WHERE post_id = ?', [id]);
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'Post not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('DB error (GET /posts/:id):', err);
    res.status(500).json({ error: err.message });
  }
});

// Create post
app.post('/posts', authenticateToken, async (req, res) => {
  try {
    // Do NOT trust userId from client. Use authenticated user id.
    const userId = req.user && req.user.id;
    const { title, content } = req.body;

    // Basic validation/sanitization
    const cleanTitle = (title || '').toString().trim();
    const cleanContent = (content || '').toString().trim();

    if (!userId) return res.status(401).json({ error: 'Authentication required' });
    if (!cleanTitle || !cleanContent) return res.status(400).json({ error: 'Title and content are required' });
    if (cleanTitle.length > 100) return res.status(400).json({ error: 'Title too long (max 100 chars)' });
    if (cleanContent.length > 256) return res.status(400).json({ error: 'Content too long (max 256 chars)' });

    const [result] = await db.query(
      'INSERT INTO POSTS (user_id, title, content, created_at) VALUES (?, ?, ?, NOW())',
      [userId, cleanTitle, cleanContent]
    );

    res.status(201).json({
      id: result.insertId,
      userId,
      title: cleanTitle,
      content: cleanContent,
      message: 'Post created successfully'
    });
  } catch (err) {
    console.error('POST /posts error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Simple middleware to authenticate JWT (used for update/delete)
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access token required' });
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
}

// Update post (only post owner can update)
app.put('/posts/:id', authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    const { title, content } = req.body;
    // Ensure the post exists and belongs to the requester
    const [rows] = await db.query('SELECT * FROM POSTS WHERE post_id = ?', [id]);
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'Post not found' });
    const post = rows[0];
    if (post.user_id != req.user.id) return res.status(403).json({ error: 'Not allowed' });

    await db.query('UPDATE POSTS SET title = ?, content = ?, updated_at = NOW() WHERE post_id = ?', [title || post.title, content || post.content, id]);
    res.json({ success: true, message: 'Post updated' });
  } catch (err) {
    console.error('PUT /posts/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete post (only owner)
app.delete('/posts/:id', authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await db.query('SELECT * FROM POSTS WHERE post_id = ?', [id]);
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'Post not found' });
    const post = rows[0];
    if (post.user_id != req.user.id) return res.status(403).json({ error: 'Not allowed' });

    await db.query('DELETE FROM POSTS WHERE post_id = ?', [id]);
    res.json({ success: true, message: 'Post deleted' });
  } catch (err) {
    console.error('DELETE /posts/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Error handler (LAST)
app.use((err, req, res, next) => {
  console.error('Server error:', err);

  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✓ API running on port ${PORT}`);
});
