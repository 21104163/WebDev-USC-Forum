// SMTP-based provider has been removed per project policy.
// This file is intentionally stubbed so any accidental imports immediately
// surface a clear error message.
require('dotenv').config();

function _throwRemoved() {
  throw new Error('SMTP provider removed. Use Gmail OAuth2 provider instead (set EMAIL_PROVIDER to "gmail").');
}

module.exports = {
  sendVerificationCodeEmail: async () => { _throwRemoved(); },
  sendPasswordResetCodeEmail: async () => { _throwRemoved(); },
  sendWelcomeEmail: async () => { _throwRemoved(); },
  testEmailConnection: async () => { _throwRemoved(); }
};
