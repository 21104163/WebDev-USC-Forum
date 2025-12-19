const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true' || false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

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

module.exports = {
  sendVerificationCodeEmail,
  sendPasswordResetCodeEmail,
  sendWelcomeEmail
};
