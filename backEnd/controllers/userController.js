const pool = require("../config/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const { hashToken, createAccessToken, issueActionToken } = require("../utils/authTokens");
const { emailEnabled, emailReady, sendAccountEmail } = require("../utils/accountEmail");

const normalizeEmail = (email) => typeof email === "string" ? email.trim().toLowerCase() : "";
const validPassword = (password) => typeof password === "string" && password.length >= 12 && password.length <= 128 && password.trim().length > 0;
const validActionToken = (token) => typeof token === "string" && /^[a-f0-9]{64}$/.test(token);

const loginUser = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = req.body?.password;
    if (!validator.isEmail(email) || typeof password !== "string" || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const [rows] = await pool.execute(
      "SELECT u.id, u.name, u.email, u.password, s.user_id AS state_user_id, s.email_verified_at, COALESCE(s.token_version, 0) AS token_version FROM users u LEFT JOIN auth_account_state s ON s.user_id = u.id WHERE u.email = ?",
      [email]
    );
    const user = rows[0];
    const match = user ? await bcrypt.compare(password, user.password) : false;
    if (!match) return res.status(401).json({ error: "Invalid email or password" });
    if (user.state_user_id && !user.email_verified_at) {
      return res.status(403).json({ error: "Please verify your email before signing in.", code: "EMAIL_UNVERIFIED" });
    }

    res.status(200).json({
      user: { id: user.id, name: user.name, email: user.email },
      token: createAccessToken(user.id, Number(user.token_version)),
    });
  } catch (error) {
    console.error("Login failed:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

const signUpUser = async (req, res) => {
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  const email = normalizeEmail(req.body?.email);
  const password = req.body?.password;
  if (!name || name.length > 255 || !validator.isEmail(email) || !validPassword(password)) {
    return res.status(400).json({ error: "Enter a name, valid email, and password of 12 to 128 characters." });
  }
  if (emailEnabled() && !emailReady()) {
    return res.status(503).json({ error: "Account email is temporarily unavailable." });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    const hash = await bcrypt.hash(password, 12);
    const [result] = await connection.execute(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hash]
    );

    let verificationToken;
    if (emailEnabled()) {
      await connection.execute("INSERT INTO auth_account_state (user_id) VALUES (?)", [result.insertId]);
      verificationToken = await issueActionToken(connection, result.insertId, "verify_email", 60 * 24);
    }
    await connection.commit();

    if (verificationToken) {
      try {
        await sendAccountEmail({
          to: email,
          subject: "Verify your Innovest email",
          path: "/verify-email",
          token: verificationToken,
        });
      } catch (error) {
        console.error("Verification email failed:", error);
        return res.status(201).json({ verificationRequired: true, emailSent: false });
      }
      return res.status(201).json({ verificationRequired: true });
    }

    return res.status(201).json({
      user: { id: result.insertId, name, email },
      token: createAccessToken(result.insertId),
    });
  } catch (error) {
    if (connection) await connection.rollback();
    if (error.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "Email already in use" });
    console.error("Signup failed:", error);
    return res.status(500).json({ error: "Signup failed" });
  } finally {
    connection?.release();
  }
};

const sendActionLink = async (email, purpose, subject, path, minutes) => {
  const [users] = await pool.execute(
    "SELECT u.id, u.email, s.user_id AS state_user_id, s.email_verified_at FROM users u LEFT JOIN auth_account_state s ON s.user_id = u.id WHERE u.email = ?",
    [email]
  );
  const user = users[0];
  if (!user || (purpose === "verify_email" && (!user.state_user_id || user.email_verified_at))) return;

  let connection;
  let token;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    token = await issueActionToken(connection, user.id, purpose, minutes);
    await connection.commit();
  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    connection?.release();
  }
  await sendAccountEmail({ to: user.email, subject, path, token });
};

const requestPasswordReset = async (req, res) => {
  if (!emailReady()) return res.status(503).json({ error: "Account email is temporarily unavailable." });
  const email = normalizeEmail(req.body?.email);
  if (!validator.isEmail(email)) return res.status(400).json({ error: "Enter a valid email address." });
  try {
    await sendActionLink(email, "reset_password", "Reset your Innovest password", "/reset-password", 30);
  } catch (error) {
    console.error("Password reset request failed:", error);
  }
  return res.json({ message: "If this address has an account, a reset link will be sent." });
};

const resendVerification = async (req, res) => {
  if (!emailReady()) return res.status(503).json({ error: "Account email is temporarily unavailable." });
  const email = normalizeEmail(req.body?.email);
  if (!validator.isEmail(email)) return res.status(400).json({ error: "Enter a valid email address." });
  try {
    await sendActionLink(email, "verify_email", "Verify your Innovest email", "/verify-email", 60 * 24);
  } catch (error) {
    console.error("Verification resend failed:", error);
  }
  return res.json({ message: "If this address needs verification, a new link will be sent." });
};

const verifyEmail = async (req, res) => {
  const token = req.body?.token;
  if (!validActionToken(token)) return res.status(400).json({ error: "Invalid or expired verification link." });
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    const [rows] = await connection.execute(
      "SELECT id, user_id FROM auth_action_tokens WHERE token_hash = ? AND purpose = 'verify_email' AND consumed_at IS NULL AND expires_at > UTC_TIMESTAMP(6) FOR UPDATE",
      [hashToken(token)]
    );
    if (!rows.length) {
      await connection.rollback();
      return res.status(400).json({ error: "Invalid or expired verification link." });
    }
    await connection.execute(
      "UPDATE auth_account_state SET email_verified_at = COALESCE(email_verified_at, UTC_TIMESTAMP(6)) WHERE user_id = ?",
      [rows[0].user_id]
    );
    await connection.execute("UPDATE auth_action_tokens SET consumed_at = UTC_TIMESTAMP(6) WHERE id = ?", [rows[0].id]);
    await connection.commit();
    return res.json({ message: "Email verified. You can now sign in." });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Email verification failed:", error);
    return res.status(500).json({ error: "Could not verify email." });
  } finally {
    connection?.release();
  }
};

const resetPassword = async (req, res) => {
  const token = req.body?.token;
  const password = req.body?.password;
  if (!validActionToken(token) || !validPassword(password)) {
    return res.status(400).json({ error: "Invalid link or password. Use 12 to 128 characters." });
  }
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    const [rows] = await connection.execute(
      "SELECT id, user_id FROM auth_action_tokens WHERE token_hash = ? AND purpose = 'reset_password' AND consumed_at IS NULL AND expires_at > UTC_TIMESTAMP(6) FOR UPDATE",
      [hashToken(token)]
    );
    if (!rows.length) {
      await connection.rollback();
      return res.status(400).json({ error: "Invalid or expired reset link." });
    }
    const hash = await bcrypt.hash(password, 12);
    await connection.execute("UPDATE users SET password = ? WHERE id = ?", [hash, rows[0].user_id]);
    await connection.execute(
      "INSERT INTO auth_account_state (user_id, email_verified_at, token_version) VALUES (?, UTC_TIMESTAMP(6), 1) ON DUPLICATE KEY UPDATE email_verified_at = COALESCE(email_verified_at, UTC_TIMESTAMP(6)), token_version = token_version + 1",
      [rows[0].user_id]
    );
    await connection.execute(
      "UPDATE auth_action_tokens SET consumed_at = UTC_TIMESTAMP(6) WHERE user_id = ? AND purpose = 'reset_password' AND consumed_at IS NULL",
      [rows[0].user_id]
    );
    await connection.commit();
    req.app?.get("io")?.in(`user:${rows[0].user_id}`).disconnectSockets(true);
    return res.json({ message: "Password updated. Sign in with your new password." });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Password reset failed:", error);
    return res.status(500).json({ error: "Could not reset password." });
  } finally {
    connection?.release();
  }
};

const logoutUser = async (req, res) => {
  try {
    const expiresAt = Number(jwt.decode(req.authToken)?.exp);
    if (!Number.isSafeInteger(expiresAt)) return res.status(401).json({ error: "Invalid token" });
    const tokenHash = hashToken(req.authToken);
    await pool.execute(
      "INSERT IGNORE INTO auth_revoked_tokens (token_hash, expires_at) VALUES (?, FROM_UNIXTIME(?))",
      [tokenHash, expiresAt]
    );
    req.app?.get("io")?.in(`token:${tokenHash}`).disconnectSockets(true);
    return res.json({ message: "Signed out" });
  } catch (error) {
    console.error("Logout failed:", error);
    return res.status(500).json({ error: "Could not sign out" });
  }
};

module.exports = { loginUser, signUpUser, requestPasswordReset, resendVerification, verifyEmail, resetPassword, logoutUser };
