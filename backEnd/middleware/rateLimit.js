const crypto = require("node:crypto");

const createRateLimit = ({ windowMs, max, key }) => {
  const attempts = new Map();

  return (req, res, next) => {
    const now = Date.now();
    const identity = crypto.createHash("sha256").update(String(key(req))).digest("hex");
    const current = attempts.get(identity);
    const entry = current && current.expiresAt > now
      ? current
      : { count: 0, expiresAt: now + windowMs };

    if (entry.count >= max) {
      res.set("Retry-After", String(Math.ceil((entry.expiresAt - now) / 1000)));
      return res.status(429).json({ error: "Too many attempts. Please try again later." });
    }

    entry.count += 1;
    attempts.delete(identity);
    attempts.set(identity, entry);
    if (attempts.size > 10000) attempts.delete(attempts.keys().next().value);
    next();
  };
};

module.exports = createRateLimit;
