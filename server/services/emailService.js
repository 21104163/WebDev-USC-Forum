require('dotenv').config();

// Dynamic provider loader - supports 'gmail' (Gmail API), 'smtp', and 'console' (dev)
const provider = process.env.EMAIL_PROVIDER || 'gmail';

let emailProvider;
try {
  if (provider === 'smtp') {
    emailProvider = require('./providers/smtpEmailService');
  } else if (provider === 'console') {
    emailProvider = require('./providers/consoleEmailService');
  } else {
    // Default to Gmail implementation
    emailProvider = require('./providers/gmailEmailService');
  }
} catch (err) {
  console.error('Error loading email provider:', err);
  throw err;
}

module.exports = {
  sendVerificationCodeEmail: emailProvider.sendVerificationCodeEmail,
  sendWelcomeEmail: emailProvider.sendWelcomeEmail
};
