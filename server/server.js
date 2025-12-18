const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Initialize database
require('./config/database');

const app = express();

const allowedOrigins = [
  'https://web-dev-usc-forum.vercel.app',
  'http://localhost:5173'
];

// CORS middleware (ONLY ONCE)
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow Postman / curl

    if (allowedOrigins.includes(origin)) return callback(null, true);

    return callback(new Error('CORS blocked: ' + origin));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));

// Basic route
app.get('/', (req, res) => res.json({ message: 'USC Forum API running' }));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✓ API running on http://localhost:${PORT}`));
