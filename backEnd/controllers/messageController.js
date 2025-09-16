const db = require("../config/database");

const getConversations = async (req, res) => {
  try {
    // Placeholder: Return empty list for now
    res.status(200).json([]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
};

const startConversation = async (req, res) => {
  try {
    // Placeholder: return dummy conversation ID
    res.status(201).json({
      message: "Conversation started (placeholder)",
      conversationId: null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to start conversation" });
  }
};

const getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    // Placeholder: Return empty message list for now
    res.status(200).json({
      conversationId: id,
      messages: [],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    // Placeholder: Return sent status only
    res.status(201).json({
      message: "Message sent (placeholder)",
      conversationId: id,
      content,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to send message" });
  }
};

module.exports = {
  getConversations,
  startConversation,
  getMessages,
  sendMessage,
};
