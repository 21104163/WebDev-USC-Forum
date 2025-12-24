const express = require('express');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');

// ✅ Single database connection (Aiven MySQL)
const db = require('./config/database');
const db2 = require('./config/database2');

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

// Preflight handled by the main CORS configuration above.

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple request logger to help debug 500s
app.use((req, res, next) => {
  console.log(`--> ${req.method} ${req.originalUrl}`);
  if (Object.keys(req.body || {}).length) console.log('    body:', req.body);
  next();
});

// Internal JWT secret (fallback to general JWT secret)
const INTERNAL_JWT_SECRET = process.env.INTERNAL_JWT_SECRET || process.env.JWT_SECRET;

// Middleware to verify JWTs for internal backend-to-backend communication
function verifyInternalJwt(req, res, next) {
  const auth = req.headers.authorization || req.headers.Authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ ok: false, error: 'Missing or malformed Authorization header' });
  }

  const token = auth.split(' ')[1];
  if (!INTERNAL_JWT_SECRET) {
    console.error('INTERNAL_JWT_SECRET not set');
    return res.status(500).json({ ok: false, error: 'Server misconfiguration' });
  }

  jwt.verify(token, INTERNAL_JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ ok: false, error: 'Invalid token', details: err.message });
    }
    // attach decoded token for handlers
    req.internal = decoded;
    next();
  });
}

// Routes
app.use('/api/auth', require('./routes/auth'));
// Posts, comments, likes routes (moved to router)
app.use('/', require('./routes/posts'));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'USC Forum API running' });
});

// --- Internal endpoints for backend-to-backend checks ---
// Simple endpoint another backend can call to validate a JWT and inspect payload
app.post('/internal/verify-token', (req, res) => {
  const auth = req.headers.authorization || req.headers.Authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(400).json({ ok: false, error: 'Missing Authorization header' });
  }

  const token = auth.split(' ')[1];
  if (!INTERNAL_JWT_SECRET) return res.status(500).json({ ok: false, error: 'Server misconfiguration' });

  jwt.verify(token, INTERNAL_JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ ok: false, error: 'Invalid token', details: err.message });
    return res.json({ ok: true, payload: decoded });
  });
});

// Protected internal route to test end-to-end communication; uses middleware
app.get('/internal/ping', verifyInternalJwt, (req, res) => {
  res.json({ ok: true, message: 'pong', tokenPayload: req.internal || null });
});


// Debug: show tables
app.get('/tables', async (req, res) => {
  try {
    const [tables] = await db2.query('SHOW TABLES');
    res.json(tables);
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Debug: list all users
app.get('/debug/users', async (req, res) => {
  try {
    const [users] = await db2.query('SELECT id, email FROM users LIMIT 10');
    res.json(users);
  } catch (err) {
    console.error('DB error:', err);
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

  const response = { message: 'Internal server error' };
  if (process.env.DEBUG_ERRORS === 'true') {
    response.error = err.message;
    response.stack = err.stack;
  }

  res.status(500).json(response);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✓ API running on port ${PORT}`);
});
//trdt