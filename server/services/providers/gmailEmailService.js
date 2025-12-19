const { google } = require('googleapis');
require('dotenv').config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

// Set refresh token
oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

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

    const fromHeader = process.env.EMAIL_FROM || 'USC Forum <noreply@uscforum.com>';
    const emailContent = `From: ${fromHeader}
To: ${email}
Subject: USC Forum - Verification Code
Content-Type: text/html; charset=UTF-8

${message}`;

    const encodedMessage = Buffer.from(emailContent)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage
      }
    });

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

    const fromHeader = process.env.EMAIL_FROM || 'USC Forum <noreply@uscforum.com>';
    const emailContent = `From: ${fromHeader}
To: ${email}
Subject: Welcome to USC Forum
Content-Type: text/html; charset=UTF-8

${message}`;

    const encodedMessage = Buffer.from(emailContent)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage
      }
    });

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

    const fromHeader = process.env.EMAIL_FROM || 'USC Forum <noreply@uscforum.com>';
    const emailContent = `From: ${fromHeader}
To: ${email}
Subject: USC Forum - Password Reset Code
Content-Type: text/html; charset=UTF-8

${message}`;

    const encodedMessage = Buffer.from(emailContent)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage
      }
    });

    console.log(`✓ Password reset code sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

module.exports = {
  sendVerificationCodeEmail,
  sendPasswordResetCodeEmail,
  sendWelcomeEmail
};
