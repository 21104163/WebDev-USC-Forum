require('dotenv').config();

// Use Gmail OAuth2 as the sole provider in production. For local development,
// you may set EMAIL_PROVIDER=console to use the console provider.
const provider = process.env.EMAIL_PROVIDER || 'gmail';

let gmailProvider;
let consoleProvider;

try {
  gmailProvider = require('./providers/gmailEmailService');
} catch (e) {
  gmailProvider = null;
}

try {
  consoleProvider = require('./providers/consoleEmailService');
} catch (e) {
  consoleProvider = null;
}

function ensureGmailAvailable() {
  if (!gmailProvider) {
    throw new Error('Gmail provider not available. Ensure `server/services/providers/gmailEmailService.js` exists and is valid.');
  }
}

module.exports = {
  sendVerificationCodeEmail: async (...args) => {
    if (provider === 'console' && consoleProvider) return consoleProvider.sendVerificationCodeEmail(...args);
    ensureGmailAvailable();
    return gmailProvider.sendVerificationCodeEmail(...args);
  },
  sendPasswordResetCodeEmail: async (...args) => {
    if (provider === 'console' && consoleProvider) return consoleProvider.sendPasswordResetCodeEmail(...args);
    ensureGmailAvailable();
    return gmailProvider.sendPasswordResetCodeEmail(...args);
  },
  sendWelcomeEmail: async (...args) => {
    if (provider === 'console' && consoleProvider) return consoleProvider.sendWelcomeEmail(...args);
    ensureGmailAvailable();
    return gmailProvider.sendWelcomeEmail(...args);
  }
};
