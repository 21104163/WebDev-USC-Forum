require('dotenv').config();

async function sendVerificationCodeEmail(email, code) {
  const message = `Sending verification code to ${email}: ${code}`;
  console.log('ConsoleEmailService:', message);
  return true;
}

async function sendWelcomeEmail(email) {
  console.log(`ConsoleEmailService: Welcome email to ${email}`);
  return true;
}

module.exports = {
  sendVerificationCodeEmail,
  sendWelcomeEmail
}
