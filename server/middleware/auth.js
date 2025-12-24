const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  const token = authHeader && authHeader.split && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access token required' });
  if (!JWT_SECRET) return res.status(500).json({ message: 'Server misconfiguration' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
}

module.exports = { authenticateToken };
