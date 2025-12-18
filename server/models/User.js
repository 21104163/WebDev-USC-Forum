const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Create user
  static async createUser(email, password) {
    const connection = await pool.getConnection();
    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      const [result] = await connection.query(
        'INSERT INTO users (email, password) VALUES (?, ?)',
        [email, hashedPassword]
      );

      return { id: result.insertId, email };
    } finally {
      connection.release();
    }
  }

  // Get user by email
  static async getUserByEmail(email) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        'SELECT id, email, password, email_verified FROM users WHERE email = ?',
        [email]
      );
      return rows[0] || null;
    } finally {
      connection.release();
    }
  }

  // Verify password
  static async verifyPassword(inputPassword, hashedPassword) {
    return await bcrypt.compare(inputPassword, hashedPassword);
  }

  // Update email verified status
  static async updateEmailVerified(email) {
    const connection = await pool.getConnection();
    try {
      await connection.query(
        'UPDATE users SET email_verified = TRUE WHERE email = ?',
        [email]
      );
    } finally {
      connection.release();
    }
  }

  // Update user's password
  static async updatePassword(email, newPassword) {
    const connection = await pool.getConnection();
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await connection.query(
        'UPDATE users SET password = ? WHERE email = ?',
        [hashedPassword, email]
      );
    } finally {
      connection.release();
    }
  }

  // Check if user exists
  static async userExists(email) {
    const user = await this.getUserByEmail(email);
    return !!user;
  }
}

module.exports = User;
