const { verifyAccessToken } = require("../utils/authTokens");

const requireAuth = async (req, res, next) => {
  const match = /^Bearer (\S+)$/i.exec(req.headers.authorization || "");
  if (!match) return res.status(401).json({ error: "Authorization token required" });

  try {
    req.user = { id: await verifyAccessToken(match[1]) };
    req.authToken = match[1];
    next();
  } catch (error) {
    if (["JsonWebTokenError", "TokenExpiredError", "NotBeforeError"].includes(error.name) ||
        ["Invalid token", "Revoked token"].includes(error.message)) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    console.error("Authentication lookup failed:", error);
    return res.status(503).json({ error: "Authentication temporarily unavailable" });
  }
};

module.exports = requireAuth;
