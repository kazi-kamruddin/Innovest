const express = require("express");
const router = express.Router();
const {
  getConversations,
  startConversation,
  getMessages,
  sendMessage,
} = require("../controllers/messageController");

const requireAuth = require("../middleware/requireAuth");

router.get("/", requireAuth, getConversations);
router.post("/start", requireAuth, startConversation);
router.get("/:id/messages", requireAuth, getMessages);
router.post("/:id/messages", requireAuth, sendMessage);

module.exports = router;
