const express = require("express");
const {
  loginUser,
  signUpUser,
  requestPasswordReset,
  resendVerification,
  verifyEmail,
  resetPassword,
  logoutUser,
} = require("../controllers/userController");
const createRateLimit = require("../middleware/rateLimit");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();
const byIp = (req) => req.ip;
const byEmail = (req) => `${req.ip}:${String(req.body?.email || "").trim().toLowerCase()}`;

router.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

router.post("/login",
  createRateLimit({ windowMs: 15 * 60 * 1000, max: 30, key: byIp }),
  createRateLimit({ windowMs: 15 * 60 * 1000, max: 10, key: byEmail }),
  loginUser
);

router.post("/register", createRateLimit({ windowMs: 60 * 60 * 1000, max: 10, key: byIp }), signUpUser);
router.post("/forgot-password",
  createRateLimit({ windowMs: 60 * 60 * 1000, max: 20, key: byIp }),
  createRateLimit({ windowMs: 60 * 60 * 1000, max: 3, key: byEmail }),
  requestPasswordReset
);
router.post("/resend-verification",
  createRateLimit({ windowMs: 60 * 60 * 1000, max: 20, key: byIp }),
  createRateLimit({ windowMs: 60 * 60 * 1000, max: 3, key: byEmail }),
  resendVerification
);
router.post("/verify-email", createRateLimit({ windowMs: 15 * 60 * 1000, max: 20, key: byIp }), verifyEmail);
router.post("/reset-password", createRateLimit({ windowMs: 15 * 60 * 1000, max: 20, key: byIp }), resetPassword);
router.post("/logout", requireAuth, logoutUser);

module.exports = router;
