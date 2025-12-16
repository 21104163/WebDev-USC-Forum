const sgMail = require('@sendgrid/mail');
require('dotenv').config();

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

async function sendVerificationCodeEmail(email, code) {
  if (!process.env.SENDGRID_API_KEY) {
    throw new Error('SENDGRID_API_KEY not set');
  }

  const html = `
    <h1>Your USC Forum Verification Code</h1>
    <p>Welcome to USC Forum!</p>
    <p>Your verification code is:</p>
    <h2 style="color: #007bff; font-size: 2em; letter-spacing: 2px;">${code}</h2>
    <p>This code will expire in 10 minutes.</p>
    <p>If you didn't request this code, please ignore this email.</p>
  `;

  const msg = {
    to: email,
    from: process.env.EMAIL_FROM,
    subject: 'USC Forum - Verification Code',
    html
  };

  await sgMail.send(msg);
  console.log(`✓ SendGrid verification code sent to ${email}`);
}

async function sendWelcomeEmail(email) {
  if (!process.env.SENDGRID_API_KEY) {
    throw new Error('SENDGRID_API_KEY not set');
  }

  const html = `
    <h1>Welcome to USC Forum!</h1>
    <p>Your account has been successfully created and verified.</p>
    <p>You can now explore the forum, create posts, and connect with other students.</p>
    <p>Happy posting!</p>
  `;

  const msg = {
    to: email,
    from: process.env.EMAIL_FROM,
    subject: 'Welcome to USC Forum',
    html
  };

  await sgMail.send(msg);
  console.log(`✓ SendGrid welcome email sent to ${email}`);
}

module.exports = {
  sendVerificationCodeEmail,
  sendWelcomeEmail
};
