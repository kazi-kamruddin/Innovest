const crypto = require('node:crypto');
const bcrypt = require('bcrypt');
const validator = require('validator');
const pool = require('../config/database');
const googleIdentity = require('../utils/googleIdentity');
const { createAccessToken } = require('../utils/authTokens');

const normalizeEmail = (email) => typeof email === 'string' ? email.trim().toLowerCase() : '';

function publicUser(row) {
  return { id: row.id, name: row.name, email: row.email };
}

async function loadUser(connection, userId) {
  const [rows] = await connection.execute(
    `SELECT u.id, u.name, u.email, COALESCE(s.token_version, 0) AS token_version
     FROM users u LEFT JOIN auth_account_state s ON s.user_id = u.id WHERE u.id = ?`,
    [userId]
  );
  return rows[0];
}

const googleSignIn = async (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID?.trim()) {
    return res.status(503).json({ error: 'Google sign-in is not configured.' });
  }
  const credential = req.body?.credential;
  if (typeof credential !== 'string' || credential.length < 100 || credential.length > 10000) {
    return res.status(400).json({ error: 'A valid Google credential is required.' });
  }

  let payload;
  try {
    payload = await googleIdentity.verifyGoogleIdToken(credential);
  } catch {
    return res.status(401).json({ error: 'Google sign-in could not be verified.' });
  }

  const googleSub = payload?.sub;
  const email = normalizeEmail(payload?.email);
  const name = typeof payload?.name === 'string' ? payload.name.trim().slice(0, 255) : '';
  if (typeof googleSub !== 'string' || !googleSub || googleSub.length > 255 ||
      !validator.isEmail(email) || email.length > 255 || payload.email_verified !== true) {
    return res.status(401).json({ error: 'Google did not provide a verified email address.' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    const [linked] = await connection.execute(
      'SELECT user_id FROM auth_google_identities WHERE google_sub = ? FOR UPDATE',
      [googleSub]
    );
    if (linked.length) {
      const user = await loadUser(connection, linked[0].user_id);
      await connection.commit();
      return res.json({ user: publicUser(user), token: createAccessToken(user.id, Number(user.token_version)) });
    }

    const [existing] = await connection.execute(
      'SELECT id, name, email, password FROM users WHERE email = ? FOR UPDATE',
      [email]
    );
    let userId;
    if (existing.length) {
      const user = existing[0];
      const linkPassword = req.body?.linkPassword;
      if (typeof linkPassword !== 'string' || !linkPassword) {
        await connection.rollback();
        return res.status(409).json({ code: 'LINK_REQUIRED', error: 'This email already has an Innovest account. Enter its password once to connect Google.' });
      }
      if (!await bcrypt.compare(linkPassword, user.password)) {
        await connection.rollback();
        return res.status(401).json({ error: 'The existing account password is incorrect.' });
      }
      const [otherLinks] = await connection.execute(
        'SELECT google_sub FROM auth_google_identities WHERE user_id = ? FOR UPDATE',
        [user.id]
      );
      if (otherLinks.length) {
        await connection.rollback();
        return res.status(409).json({ error: 'This account is already connected to a different Google account.' });
      }
      userId = user.id;
      await connection.execute(
        `INSERT INTO auth_account_state (user_id, email_verified_at) VALUES (?, UTC_TIMESTAMP(6))
         ON DUPLICATE KEY UPDATE email_verified_at = COALESCE(email_verified_at, UTC_TIMESTAMP(6))`,
        [userId]
      );
    } else {
      const randomPassword = crypto.randomBytes(48).toString('hex');
      const hash = await bcrypt.hash(randomPassword, 12);
      const [created] = await connection.execute(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [name || email.split('@')[0], email, hash]
      );
      userId = created.insertId;
      await connection.execute(
        'INSERT INTO auth_account_state (user_id, email_verified_at) VALUES (?, UTC_TIMESTAMP(6))',
        [userId]
      );
    }

    await connection.execute(
      'INSERT INTO auth_google_identities (google_sub, user_id) VALUES (?, ?)',
      [googleSub, userId]
    );
    const user = await loadUser(connection, userId);
    await connection.commit();
    return res.json({ user: publicUser(user), token: createAccessToken(user.id, Number(user.token_version)) });
  } catch (error) {
    if (connection) await connection.rollback();
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'This account changed during sign-in. Please try again.' });
    }
    console.error('Google sign-in failed:', error);
    return res.status(500).json({ error: 'Google sign-in failed.' });
  } finally {
    connection?.release();
  }
};

module.exports = { googleSignIn };
