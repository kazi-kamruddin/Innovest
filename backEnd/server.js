require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { randomUUID } = require("node:crypto");
const { Server } = require("socket.io");
const db = require("./config/database");
const { authenticateSocket, protectSocketSession } = require('./middleware/socketAuth');
const { notifyBestEffort } = require('./utils/notifications');
const { messageContentError } = require('./utils/messageValidation');

if (!process.env.SECRET) throw new Error("SECRET must be configured");

const userRoutes = require("./routes/userRoutes");
const pitchRoutes = require("./routes/pitchRoutes");
const userInfoRoutes = require("./routes/userInfoRoutes");
const investorInfoRoutes = require("./routes/investorInfoRoutes");
const investorRequestRoutes = require("./routes/investorRequestRoutes");
const messageRoutes = require("./routes/messageRoutes");
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
app.set("trust proxy", 1);

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use((req, res, next) => {
  res.set("Referrer-Policy", "no-referrer");
  res.set("X-Content-Type-Options", "nosniff");
  res.set("X-Frame-Options", "DENY");
  res.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  res.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  const requestId = randomUUID();
  const started = Date.now();
  res.set("X-Request-Id", requestId);
  res.on("finish", () => {
    console.log(JSON.stringify({
      requestId,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      durationMs: Date.now() - started,
    }));
  });
  next();
});

app.get("/", (req, res) => {
  res.json({ service: "Innovest API", status: "ok" });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/ready", async (req, res) => {
  res.set("Cache-Control", "no-store");
  try {
    await db.query({ sql: "SELECT 1 FROM auth_account_state LIMIT 1", timeout: 3000 });
    await db.query({ sql: "SELECT 1 FROM auth_action_tokens LIMIT 1", timeout: 3000 });
    await db.query({ sql: "SELECT 1 FROM auth_revoked_tokens LIMIT 1", timeout: 3000 });
    await db.query({ sql: "SELECT 1 FROM pitch_response_states LIMIT 1", timeout: 3000 });
    await db.query({ sql: "SELECT 1 FROM user_notifications LIMIT 1", timeout: 3000 });
    await db.query({ sql: "SELECT 1 FROM auth_google_identities LIMIT 1", timeout: 3000 });
    res.json({ status: "ready" });
  } catch (error) {
    console.error("Readiness check failed:", error.message);
    res.status(503).json({ status: "unavailable" });
  }
});

(async () => {
  try {
    const conn = await db.getConnection();
    console.log("Connected to MySQL");
    conn.release();
  } catch (err) {
    console.error("Database connection failed:", err);
  }
})();

app.use("/user", userRoutes);
app.use("/pitches", pitchRoutes);
app.use("/profile", userInfoRoutes);
app.use("/investor-info", investorInfoRoutes);
app.use("/investor-request", investorRequestRoutes);
app.use("/conversations", messageRoutes);
app.use('/notifications', notificationRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
});
app.set("io", io);

io.use(authenticateSocket);

io.on("connection", (socket) => {
  protectSocketSession(socket);
  const userId = socket.data.userId;
  socket.join(`user:${userId}`);
  socket.join(`token:${socket.data.tokenHash}`);
  console.log("A user connected, socket id:", socket.id);

  let knockCount = 0;
  let knockReset = Date.now() + 60000;
  let msgCount = 0;
  let msgReset = Date.now() + 60000;

  socket.on("disconnect", () => {
    console.log(`User ${userId} disconnected.`);
  });

  socket.on("knock_user", async (payload) => {
    try {
      const now = Date.now();
      if (now > knockReset) { knockCount = 0; knockReset = now + 60000; }
      knockCount += 1;
      if (knockCount > 15) {
        return socket.emit("knock_error", { message: "Too many knock requests. Please wait a moment." });
      }

      const receiverId = payload?.receiverId;
      const senderId = userId;
      const targetId = Number(receiverId);
      if (!Number.isSafeInteger(targetId) || targetId <= 0 || targetId === senderId) {
        return socket.emit("knock_error", { message: "Invalid recipient" });
      }

      const [recipients] = await db.execute("SELECT id FROM users WHERE id = ?", [targetId]);
      if (recipients.length === 0) {
        return socket.emit("knock_error", { message: "Recipient not found" });
      }

      const userOne = Math.min(senderId, targetId);
      const userTwo = Math.max(senderId, targetId);

      const [existing] = await db.execute(
        `SELECT * FROM conversations 
         WHERE (user_one_id = ? AND user_two_id = ?) 
            OR (user_one_id = ? AND user_two_id = ?)`,
        [senderId, targetId, targetId, senderId]
      );

      let conversationId;
      if (existing.length > 0) {
        conversationId = existing[0].id;
      } else {
        const [result] = await db.execute(
          "INSERT INTO conversations (user_one_id, user_two_id, created_at) VALUES (?, ?, NOW())",
          [userOne, userTwo]
        );
        conversationId = result.insertId;
      }

      [senderId, targetId].forEach((id) => {
        io.to(`user:${id}`).emit("new_conversation", {
          conversationId,
          partnerId: id === senderId ? targetId : senderId,
        });
      });

    } catch (err) {
      console.error("Error handling knock:", err);
      socket.emit("knock_error", { message: "Failed to create conversation" });
    }
  });

  socket.on(
    "send_message",
    async (payload) => {
      try {
        const now = Date.now();
        if (now > msgReset) { msgCount = 0; msgReset = now + 60000; }
        msgCount += 1;
        if (msgCount > 60) {
          return socket.emit("send_message_error", { message: "Too many messages sent. Please slow down." });
        }

        const { conversationId, content } = payload || {};
        const senderId = userId;
        const contentError = messageContentError(content);
        if (contentError) {
          return socket.emit("send_message_error", { message: contentError });
        }

        const [rows] = await db.execute(
          "SELECT user_one_id, user_two_id FROM conversations WHERE id = ?",
          [conversationId]
        );
        if (rows.length === 0 || ![rows[0].user_one_id, rows[0].user_two_id].includes(senderId)) {
          return socket.emit("send_message_error", { message: "Not authorized for this conversation" });
        }

        const createdAt = new Date();

        const [result] = await db.execute(
          "INSERT INTO messages (conversation_id, sender_id, body, created_at) VALUES (?, ?, ?, ?)",
          [conversationId, senderId, content, createdAt]
        );

        const messageData = {
          id: result.insertId,
          conversationId,
          senderId,
          content,
          created_at: createdAt,
        };

        const { user_one_id, user_two_id } = rows[0];
        const receiverId = senderId === user_one_id ? user_two_id : user_one_id;

        io.to(`user:${senderId}`).to(`user:${receiverId}`).emit("receive_message", messageData);
        await notifyBestEffort({
          userId: receiverId,
          actorId: senderId,
          kind: 'message',
          text: 'You have a new message.',
          targetPath: `/messages?conversation=${encodeURIComponent(conversationId)}`,
          io,
        });

      } catch (err) {
        console.error("Error sending message:", err);
        socket.emit("send_message_error", { message: "Failed to send message" });
      }
    }
  );
});


const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const gracefulShutdown = (signal) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    try {
      if (io) io.close();
      await db.end();
      console.log("Closed HTTP server, Socket.IO, and MySQL pool.");
      process.exit(0);
    } catch (err) {
      console.error("Error during graceful shutdown:", err);
      process.exit(1);
    }
  });
  setTimeout(() => {
    console.error("Forcefully terminating after timeout.");
    process.exit(1);
  }, 10000).unref();
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

