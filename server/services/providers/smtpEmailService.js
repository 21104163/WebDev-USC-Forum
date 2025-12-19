const nodemailer = require('nodemailer');
require('dotenv').config();

// ----------------------------
// Nodemailer transporter
// ----------------------------
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,          // ✅ Required for Gmail on Render
  secure: false,      // ❌ Must be false for port 587
  auth: {
    user: process.env.SMTP_USER, // Gmail address
    pass: process.env.SMTP_PASS, // Gmail App Password
  },
  tls: {
    rejectUnauthorized: false    // ✅ prevents Render TLS issues
  }
});

// Optional: Verify connection on startup
transporter.verify((err, success) => {
  if (err) {
    console.error('❌ SMTP ERROR:', err);
  } else {
    console.log('✅ SMTP READY');
  }
});

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

  await transporter.sendMail(mailOptions);
  console.log(`✓ SMTP verification code sent to ${email}`);
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

  await transporter.sendMail(mailOptions);
  console.log(`✓ SMTP welcome email sent to ${email}`);
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

  await transporter.sendMail(mailOptions);
  console.log(`✓ SMTP password reset code sent to ${email}`);
}

// ----------------------------
// Exports
// ----------------------------
module.exports = {
  sendVerificationCodeEmail,
  sendPasswordResetCodeEmail,
  sendWelcomeEmail
};
