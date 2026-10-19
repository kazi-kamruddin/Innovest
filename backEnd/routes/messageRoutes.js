const express = require("express");
const router = express.Router();
router.param('id', require('../middleware/validateId'));
const {
  getConversations,
  startConversation,
  getMessages,
  sendMessage,
} = require("../controllers/messageController");

const requireAuth = require("../middleware/requireAuth");
const createRateLimit = require("../middleware/rateLimit");

const byUserOrIp = (req) => `${req.ip}:${req.user?.id || ""}`;

router.get("/", requireAuth, getConversations);
router.post(
  "/start",
  requireAuth,
  createRateLimit({ windowMs: 15 * 60 * 1000, max: 30, key: byUserOrIp }),
  startConversation
);
router.get("/:id/messages", requireAuth, getMessages);
router.post(
  "/:id/messages",
  requireAuth,
  createRateLimit({ windowMs: 60 * 1000, max: 60, key: byUserOrIp }),
  sendMessage
);

module.exports = router;
