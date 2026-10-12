const { verifyAccessToken } = require('../utils/authTokens');

const optionalAuth = async (req, res, next) => {
  const match = /^Bearer (\S+)$/i.exec(req.headers.authorization || '');
  if (!match) return next();

  try {
    req.user = { id: await verifyAccessToken(match[1]) };
  } catch (error) {
    if (!['JsonWebTokenError', 'TokenExpiredError', 'NotBeforeError'].includes(error.name) &&
        !['Invalid token', 'Revoked token'].includes(error.message)) {
      console.error('Optional authentication lookup failed:', error);
      return res.status(503).json({ error: 'Authentication temporarily unavailable' });
    }
  }
  next();
};

module.exports = optionalAuth;
