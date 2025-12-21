const { google } = require('googleapis');
const nodemailer = require('nodemailer');
require('dotenv').config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

// Set refresh token
oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

// Determine sending address and default From header.
// Prefer an explicit EMAIL_FROM env var. If that's not set, use the OAuth
// account email (GMAIL_USER) and show the friendly name 'USC Forum'.
const SENDING_EMAIL = process.env.GMAIL_USER || process.env.GOOGLE_USER || process.env.EMAIL_USER || null;
const DEFAULT_FROM = process.env.EMAIL_FROM || `USC Forum <${SENDING_EMAIL || 'noreply@uscforum.com'}>`;

// Nodemailer transporter using OAuth2 (XOAUTH2)
let transporter = null;
async function getTransporter() {
  if (transporter) return transporter;
  const sendingUser = SENDING_EMAIL || process.env.GMAIL_USER || process.env.GOOGLE_USER || process.env.EMAIL_USER;
  const accessTokenObj = await oauth2Client.getAccessToken();
  const accessToken = accessTokenObj && accessTokenObj.token ? accessTokenObj.token : null;

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: sendingUser,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
      accessToken
    }
  });

  return transporter;
}

// Send verification code email
async function sendVerificationCodeEmail(email, code) {
  try {
    const message = `
      <h1>Your USC Forum Verification Code</h1>
      <p>Welcome to USC Forum!</p>
      <p>Your verification code is:</p>
      <h2 style="color: #007bff; font-size: 2em; letter-spacing: 2px;">${code}</h2>
      <p>This code will expire in 10 minutes.</p>
      <p>If you didn't request this code, please ignore this email.</p>
    `;

    const fromHeader = DEFAULT_FROM;
    const mailOptions = {
      from: fromHeader,
      to: email,
      subject: 'USC Forum - Verification Code',
      html: message
    };

    const t = await getTransporter();
    await t.sendMail(mailOptions);

    console.log(`✓ Verification code sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

// Send welcome email
async function sendWelcomeEmail(email) {
  try {
    const message = `
      <h1>Welcome to USC Forum!</h1>
      <p>Your account has been successfully created and verified.</p>
      <p>You can now explore the forum, create posts, and connect with other students.</p>
      <p>Happy posting!</p>
    `;

    const fromHeader = DEFAULT_FROM;
    const mailOptions = {
      from: fromHeader,
      to: email,
      subject: 'Welcome to USC Forum',
      html: message
    };

    const t = await getTransporter();
    await t.sendMail(mailOptions);

    console.log(`✓ Welcome email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

// Send password reset code email
async function sendPasswordResetCodeEmail(email, code) {
  try {
    const message = `
      <h1>Your USC Forum Password Reset Code</h1>
      <p>We received a request to reset the password for your USC Forum account.</p>
      <p>Your reset code is:</p>
      <h2 style="color: #dc3545; font-size: 2em; letter-spacing: 2px;">${code}</h2>
      <p>This code will expire in 10 minutes.</p>
      <p>If you didn't request a password reset, please ignore this email.</p>
    `;

    const fromHeader = DEFAULT_FROM;
    const mailOptions = {
      from: fromHeader,
      to: email,
      subject: 'USC Forum - Password Reset Code',
      html: message
    };

    const t = await getTransporter();
    await t.sendMail(mailOptions);

    console.log(`✓ Password reset code sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

// Test connection / authentication with Gmail OAuth2 transporter
async function testEmailConnection() {
  try {
    const t = await getTransporter();
    await t.verify();
    // Try to get profile for nicer message (non-fatal)
    try {
      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
      const profile = await gmail.users.getProfile({ userId: 'me' });
      const addr = (profile && profile.data && profile.data.emailAddress) || SENDING_EMAIL;
      return { success: true, message: `SMTP OAuth2 transporter verified as ${addr}` };
    } catch (e) {
      return { success: true, message: 'SMTP OAuth2 transporter verified' };
    }
  } catch (err) {
    return { success: false, error: err && err.message ? err.message : String(err) };
  }
}

module.exports = {
  sendVerificationCodeEmail,
  sendPasswordResetCodeEmail,
  sendWelcomeEmail,
  testEmailConnection
};

