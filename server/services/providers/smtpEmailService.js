// This file remains to avoid breaking imports but is inactive.
// SMTP usage is discouraged in this deployment (may be blocked by host).
// All emailing should use the Gmail OAuth2 provider (`gmailEmailService`).

module.exports = {
  sendVerificationCodeEmail: async () => { throw new Error('SMTP provider disabled; use Gmail OAuth2 provider.'); },
  sendPasswordResetCodeEmail: async () => { throw new Error('SMTP provider disabled; use Gmail OAuth2 provider.'); },
  sendWelcomeEmail: async () => { throw new Error('SMTP provider disabled; use Gmail OAuth2 provider.'); },
  testEmailConnection: async () => { throw new Error('SMTP provider disabled; use Gmail OAuth2 provider.'); }
};
