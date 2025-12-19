const nodemailer = require('nodemailer');
require('dotenv').config();

// ----------------------------
// Nodemailer transporter
// ----------------------------
const transporter = nodemailer.createTransport({
  service: 'gmail', // Shortcut for Gmail (sets host/port automatically)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, // Your 16-character App Password
  },
  tls: {
    // Required for Render's networking environment
    rejectUnauthorized: false 
  },
  // Increased timeouts for stable handshakes in production
  connectionTimeout: 20000, 
  greetingTimeout: 20000,
  socketTimeout: 30000,
  logger: true,
  debug: true
});

// Verify connection on startup
transporter.verify((err, success) => {
  if (err) {
    console.error('❌ SMTP VERIFY ERROR:', err.message);
  } else {
    console.log('✅ SMTP READY - Connection Established');
  }
});

// NEW: Connection Test Function
async function testEmailConnection() {
  try {
    await transporter.verify();
    return { success: true, message: "SMTP is connected and ready" };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ----------------------------
// Send verification code email
// ----------------------------
async function sendVerificationCodeEmail(email, code) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('SMTP credentials not configured');
  }

  const html = `
    <h1>Your USC Forum Verification Code</h1>
    <p>Welcome to USC Forum!</p>
    <p>Your verification code is:</p>
    <h2 style="color: #007bff; font-size: 2em; letter-spacing: 2px;">${code}</h2>
    <p>This code will expire in 10 minutes.</p>
    <p>If you didn't request this code, please ignore this email.</p>
  `;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'USC Forum - Verification Code',
    html
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✓ SMTP verification code sent to ${email}`);
  } catch (err) {
    console.error('❌ SMTP SEND ERROR (verification):', err && err.code ? err.code : err.message || err);
    throw err;
  }
}

// ----------------------------
// Send welcome email
// ----------------------------
async function sendWelcomeEmail(email) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('SMTP credentials not configured');
  }

  const html = `
    <h1>Welcome to USC Forum!</h1>
    <p>Your account has been successfully created and verified.</p>
    <p>You can now explore the forum, create posts, and connect with other students.</p>
    <p>Happy posting!</p>
  `;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Welcome to USC Forum',
    html
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✓ SMTP welcome email sent to ${email}`);
  } catch (err) {
    console.error('❌ SMTP SEND ERROR (welcome):', err && err.code ? err.code : err.message || err);
    throw err;
  }
}

// ----------------------------
// Send password reset code email
// ----------------------------
async function sendPasswordResetCodeEmail(email, code) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('SMTP credentials not configured');
  }

  const html = `
    <h1>Your USC Forum Password Reset Code</h1>
    <p>We received a request to reset the password for your USC Forum account.</p>
    <p>Your reset code is:</p>
    <h2 style="color: #dc3545; font-size: 2em; letter-spacing: 2px;">${code}</h2>
    <p>This code will expire in 10 minutes.</p>
    <p>If you didn't request a password reset, please ignore this email.</p>
  `;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'USC Forum - Password Reset Code',
    html
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✓ SMTP password reset code sent to ${email}`);
  } catch (err) {
    console.error('❌ SMTP SEND ERROR (reset):', err && err.code ? err.code : err.message || err);
    throw err;
  }
}

// ----------------------------
// Exports
// ----------------------------
module.exports = {
  sendVerificationCodeEmail,
  sendPasswordResetCodeEmail,
  sendWelcomeEmail,
  testEmailConnection // Added to exports
};
