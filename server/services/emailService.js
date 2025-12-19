require('dotenv').config();

// Prefer OAuth2 Gmail provider first, fall back to SMTP provider if Gmail fails.
// Still support `console` provider for local dev and `smtp` to force SMTP only.
const provider = process.env.EMAIL_PROVIDER || 'gmail';

let gmailProvider = null;
let smtpProvider = null;
let consoleProvider = null;

try { gmailProvider = require('./providers/gmailEmailService'); } catch (e) { /* not available */ }
try { smtpProvider = require('./providers/smtpEmailService'); } catch (e) { /* not available */ }
try { consoleProvider = require('./providers/consoleEmailService'); } catch (e) { /* not available */ }

async function sendWithFallback(method, ...args) {
  // If console provider explicitly requested, use it.
  if (provider === 'console' && consoleProvider && consoleProvider[method]) {
    return consoleProvider[method](...args);
  }

  // If provider forced to smtp, use it directly (no oauth attempt).
  if (provider === 'smtp' && smtpProvider && smtpProvider[method]) {
    return smtpProvider[method](...args);
  }

  // Try Gmail (OAuth2) first when available
  if (gmailProvider && gmailProvider[method]) {
    try {
      return await gmailProvider[method](...args);
    } catch (err) {
      console.error(`gmail provider failed for ${method}:`, err && err.message ? err.message : err);
      // fallthrough to smtp
    }
  }

  // Fallback to SMTP provider if available
  if (smtpProvider && smtpProvider[method]) {
    try {
      return await smtpProvider[method](...args);
    } catch (err) {
      console.error(`smtp provider failed for ${method}:`, err && err.message ? err.message : err);
      throw err;
    }
  }

  // If console provider is available as last resort
  if (consoleProvider && consoleProvider[method]) {
    return consoleProvider[method](...args);
  }

  throw new Error('No email provider available for ' + method);
}

module.exports = {
  sendVerificationCodeEmail: (...args) => sendWithFallback('sendVerificationCodeEmail', ...args),
  sendPasswordResetCodeEmail: (...args) => sendWithFallback('sendPasswordResetCodeEmail', ...args),
  sendWelcomeEmail: (...args) => sendWithFallback('sendWelcomeEmail', ...args)
};
