const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client();

async function verifyGoogleIdToken(credential) {
  const audience = process.env.GOOGLE_CLIENT_ID?.trim();
  if (!audience) throw new Error('Google authentication is not configured');
  const ticket = await client.verifyIdToken({ idToken: credential, audience });
  return ticket.getPayload();
}

module.exports = { verifyGoogleIdToken };
