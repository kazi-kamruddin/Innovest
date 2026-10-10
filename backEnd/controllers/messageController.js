const db = require("../config/database");

const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const [convos] = await db.execute(
      `SELECT c.id, c.user_one_id, c.user_two_id, c.created_at,
              u1.name as user1_name, u2.name as user2_name
       FROM conversations c
       JOIN users u1 ON c.user_one_id = u1.id
       JOIN users u2 ON c.user_two_id = u2.id
       WHERE c.user_one_id = ? OR c.user_two_id = ?
       ORDER BY c.created_at DESC`,
      [userId, userId]
    );

    res.status(200).json(convos);
  } catch (error) {
    console.error("getConversations error:", error);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
};

const startConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const targetUserId = Number(req.body?.targetUserId);

    if (!Number.isSafeInteger(targetUserId) || targetUserId <= 0 || targetUserId === userId) {
      return res.status(400).json({ error: "A valid recipient other than yourself is required" });
    }

    const [recipients] = await db.execute("SELECT id FROM users WHERE id = ?", [targetUserId]);
    if (recipients.length === 0) {
      return res.status(404).json({ error: "Recipient not found" });
    }

    const [existing] = await db.execute(
      `SELECT * FROM conversations
       WHERE (user_one_id = ? AND user_two_id = ?)
          OR (user_one_id = ? AND user_two_id = ?)`,
      [userId, targetUserId, targetUserId, userId]
    );

    if (existing.length > 0) {
      return res.status(200).json(existing[0]);
    }

    const [result] = await db.execute(
      "INSERT INTO conversations (user_one_id, user_two_id, created_at) VALUES (?, ?, NOW())",
      [userId, targetUserId]
    );

    res.status(201).json({
      id: result.insertId,
      user_one_id: userId,
      user_two_id: targetUserId,
    });
  } catch (error) {
    console.error("startConversation error:", error);
    res.status(500).json({ error: "Failed to start conversation" });
  }
};

const getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const [check] = await db.execute(
      `SELECT * FROM conversations
       WHERE id = ? AND (user_one_id = ? OR user_two_id = ?)`,
      [id, userId, userId]
    );

    if (check.length === 0) {
      return res.status(403).json({ error: "Not authorized for this conversation" });
    }

    const [msgs] = await db.execute(
      `SELECT id, conversation_id, sender_id, body as content, created_at
      FROM messages WHERE conversation_id = ? ORDER BY created_at ASC`,
      [id]
    );


    res.status(200).json(msgs);
  } catch (error) {
    console.error("getMessages error:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

const sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { content } = req.body || {};

    if (typeof content !== "string" || !content.trim()) {
      return res.status(400).json({ error: "Message content is required" });
    }

    const [check] = await db.execute(
      `SELECT * FROM conversations
       WHERE id = ? AND (user_one_id = ? OR user_two_id = ?)`,
      [id, userId, userId]
    );

    if (check.length === 0) {
      return res.status(403).json({ error: "Not authorized for this conversation" });
    }

    const [result] = await db.execute(
      "INSERT INTO messages (conversation_id, sender_id, body, created_at) VALUES (?, ?, ?, NOW())",
      [id, userId, content]
    );

    const message = {
      id: result.insertId,
      conversation_id: id,
      sender_id: userId,
      content,
      created_at: new Date(),
    };

    const io = req.app?.get("io");
    if (io) {
      const partnerId = check[0].user_one_id === userId ? check[0].user_two_id : check[0].user_one_id;
      io.to(`user:${userId}`).to(`user:${partnerId}`).emit("receive_message", message);
    }

    res.status(201).json(message);
  } catch (error) {
    console.error("sendMessage error:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
};

module.exports = {
  getConversations,
  startConversation,
  getMessages,
  sendMessage,
};
