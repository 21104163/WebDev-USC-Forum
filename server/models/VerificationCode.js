const pool = require('../config/database');

class VerificationCode {
  // Generate and store verification code
  static async generateCode(email) {
    const connection = await pool.getConnection();
    try {
      // Generate 6-digit random code
      const code = Math.floor(Math.random() * 1000000)
        .toString()
        .padStart(6, '0');

      // Code expires in 10 minutes
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      // Delete previous codes for this email
      await connection.query(
        'DELETE FROM verification_codes WHERE email = ?',
        [email]
      );

      // Insert new code
      await connection.query(
        'INSERT INTO verification_codes (email, code, expires_at) VALUES (?, ?, ?)',
        [email, code, expiresAt]
      );

      return code;
    } finally {
      connection.release();
    }
  }

  // Verify code
  static async verifyCode(email, code) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        'SELECT * FROM verification_codes WHERE email = ? AND code = ? AND expires_at > NOW()',
        [email, code]
      );

      if (rows.length === 0) {
        return false;
      }

      // Do NOT delete the code here. Verification (checking) is separate from consuming
      // the code. Deleting is handled by `consumeCode` when the signup actually completes.
      return true;
    } finally {
      connection.release();
    }
  }

  // Consume (delete) a code when it's used for signup/reset
  static async consumeCode(email, code) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        'SELECT * FROM verification_codes WHERE email = ? AND code = ? AND expires_at > NOW()',
        [email, code]
      );

      if (rows.length === 0) {
        return false;
      }

      await connection.query(
        'DELETE FROM verification_codes WHERE email = ? AND code = ?',
        [email, code]
      );

      return true;
    } finally {
      connection.release();
    }
  }
}

module.exports = VerificationCode;
