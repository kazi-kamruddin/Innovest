
const express = require("express");
const router = express.Router();
const { 
    getConversations,
    startConversation, 
    getMessages, 
    sendMessage 
} = require("../controllers/messageController");

const requireAuth = require("../middleware/requireAuth");



router.get("/conversations", requireAuth, getConversations);
router.post("/conversations/start", requireAuth, startConversation);
router.get("/conversations/:id", requireAuth, getMessages);
router.post("/conversations/:id/messages", requireAuth, sendMessage);

module.exports = router;
