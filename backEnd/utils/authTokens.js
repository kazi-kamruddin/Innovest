const crypto = require("node:crypto");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const createAccessToken = (id, version = 0) => jwt.sign(
  { id, version },
  process.env.SECRET,
  { expiresIn: "2d" }
);

const issueActionToken = async (connection, userId, purpose, minutes) => {
  const token = crypto.randomBytes(32).toString("hex");
  await connection.execute(
    "DELETE FROM auth_action_tokens WHERE user_id = ? AND purpose = ? AND consumed_at IS NULL",
    [userId, purpose]
  );
  await connection.execute(
    "INSERT INTO auth_action_tokens (user_id, purpose, token_hash, expires_at) VALUES (?, ?, ?, DATE_ADD(UTC_TIMESTAMP(6), INTERVAL ? MINUTE))",
    [userId, purpose, hashToken(token), minutes]
  );
  return token;
};

const verifyAccessToken = async (token) => {
  const decoded = jwt.verify(token, process.env.SECRET);
  const id = Number(decoded.id);
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error("Invalid token");

  const [rows] = await pool.execute(
    "SELECT COALESCE(s.token_version, 0) AS token_version, EXISTS(SELECT 1 FROM auth_revoked_tokens r WHERE r.token_hash = ?) AS revoked FROM users u LEFT JOIN auth_account_state s ON s.user_id = u.id WHERE u.id = ?",
    [hashToken(token), id]
  );
  if (rows.length !== 1 || rows[0].revoked || Number(rows[0].token_version) !== Number(decoded.version ?? 0)) {
    throw new Error("Revoked token");
  }
  return id;
};

module.exports = { hashToken, createAccessToken, issueActionToken, verifyAccessToken };
