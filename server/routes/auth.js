const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const VerificationCode = require('../models/VerificationCode');
const { sendVerificationCodeEmail, sendPasswordResetCodeEmail, sendWelcomeEmail } = require('../services/emailService');
require('dotenv').config();

const router = express.Router();

// Send verification code
router.post('/send-code', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if email is already registered
    const existingUser = await User.userExists(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Generate verification code
    const code = await VerificationCode.generateCode(email);

    // Send password-reset email with code
    await sendPasswordResetCodeEmail(email, code);

    res.json({ 
      success: true, 
      message: 'Verification code sent to your email' 
    });
  } catch (error) {
    console.error('Error sending code:', error);
    res.status(500).json({ message: 'Error sending verification code' });
  }
});

// Verify code
router.post('/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: 'Email and code are required' });
    }

    // Verify the code
    const isValid = await VerificationCode.verifyCode(email, code);

    if (!isValid) {
      return res.status(400).json({ message: 'Invalid or expired code' });
    }

    res.json({ 
      success: true, 
      message: 'Code verified' 
    });
  } catch (error) {
    console.error('Error verifying code:', error);
    res.status(500).json({ message: 'Error verifying code' });
  }
});

// Check if email exists (returns { exists: true/false })
router.get('/check-email', async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const exists = await User.userExists(email);
    res.json({ exists: !!exists });
  } catch (error) {
    console.error('Error checking email:', error);
    res.status(500).json({ message: 'Error checking email' });
  }
});

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, code } = req.body;

    if (!email || !password || !code) {
      return res.status(400).json({ message: 'Email, password, and code are required' });
    }

    // Consume (verify + delete) the code for signup
    const isValid = await VerificationCode.consumeCode(email, code);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid or expired code' });
    }

    // Check if user already exists
    if (await User.userExists(email)) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create user
    const user = await User.createUser(email, password);

    // Mark email as verified
    await User.updateEmailVerified(email);

    // Send welcome email
    await sendWelcomeEmail(email);

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.json({
      success: true,
      message: 'Account created successfully',
      token,
      user: { id: user.id, email: user.email }
    });
  } catch (error) {
    console.error('Error creating account:', error);
    res.status(500).json({ message: 'Error creating account' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Get user
    const user = await User.getUserByEmail(email);

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isPasswordValid = await User.verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email }
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// Forgot password - send code
router.post('/forgot-password/send-code', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if email is registered
    const existingUser = await User.userExists(email);
    if (!existingUser) {
      // For security you may want to return success to avoid revealing account existence.
      return res.status(400).json({ message: 'Email not found' });
    }

    // Generate verification code
    const code = await VerificationCode.generateCode(email);

    // Send email with code
    await sendVerificationCodeEmail(email, code);

    res.json({ success: true, message: 'Password reset code sent to your email' });
  } catch (error) {
    console.error('Error sending password reset code:', error);
    res.status(500).json({ message: 'Error sending password reset code' });
  }
});

// Forgot password - reset
router.post('/forgot-password/reset', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: 'Email, code, and newPassword are required' });
    }

    // Verify the code
    const isValid = await VerificationCode.verifyCode(email, code);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid or expired code' });
    }

    // Ensure the new password is not the same as the current password
    const user = await User.getUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: 'Email not found' });
    }

    const isSame = await User.verifyPassword(newPassword, user.password);
    if (isSame) {
      return res.status(400).json({ message: 'New password must be different from the old password' });
    }

    // Update password
    await User.updatePassword(email, newPassword);

    res.json({ success: true, message: 'Password has been reset' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Error resetting password' });
  }
});

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}

// Get current user (protected route)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.getUserByEmail(req.user.email);
    res.json({
      id: user.id,
      email: user.email,
      email_verified: user.email_verified
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
});

module.exports = router;
