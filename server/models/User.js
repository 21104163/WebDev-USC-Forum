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
      
      // Save initial password to history
      try {
        await connection.query(
          'INSERT INTO password_history (user_id, password_hash) VALUES (?, ?)',
          [result.insertId, hashedPassword]
        );
      } catch (e) {
        // Non-fatal: history table may not exist yet. Log for visibility.
        console.warn('Could not write to password_history:', e.message);
      }

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
      // Get current password and user id
      const [rows] = await connection.query(
        'SELECT id, password FROM users WHERE email = ?',
        [email]
      );
      const user = rows[0];
      if (!user) throw new Error('User not found');

      // Store current password in history
      try {
        await connection.query(
          'INSERT INTO password_history (user_id, password_hash) VALUES (?, ?)',
          [user.id, user.password]
        );
      } catch (e) {
        console.warn('Could not write to password_history:', e.message);
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await connection.query(
        'UPDATE users SET password = ? WHERE email = ?',
        [hashedPassword, email]
      );
    } finally {
      connection.release();
    }
  }

  // Add a password hash directly to history for a user
  static async addPasswordToHistory(userId, passwordHash) {
    const connection = await pool.getConnection();
    try {
      await connection.query(
        'INSERT INTO password_history (user_id, password_hash) VALUES (?, ?)',
        [userId, passwordHash]
      );
    } finally {
      connection.release();
    }
  }

  // Check whether a plaintext password matches any of the last `limit` passwords
  static async isPasswordInHistory(userId, plainPassword, limit = 5) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        'SELECT password_hash FROM password_history WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
        [userId, limit]
      );
      for (const row of rows) {
        if (await bcrypt.compare(plainPassword, row.password_hash)) {
          return true;
        }
      }
      return false;
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
