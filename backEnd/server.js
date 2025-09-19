require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const db = require("./config/database");

const userRoutes = require("./routes/userRoutes");
const pitchRoutes = require("./routes/pitchRoutes");
const userInfoRoutes = require("./routes/userInfoRoutes");
const investorInfoRoutes = require("./routes/investorInfoRoutes");
const investorRequestRoutes = require("./routes/investorRequestRoutes");
const messageRoutes = require("./routes/messageRoutes");

const app = express();
const onlineUsers = new Map();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

(async () => {
  try {
    const conn = await db.getConnection();
    console.log("Connected to RAILWAY MySQL");
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




const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("A user connected, socket id:", socket.id);

  socket.on("user_connected", (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`User ${userId} is online.`);
  });

  socket.on("disconnect", () => {
    for (let [key, value] of onlineUsers.entries()) {
      if (value === socket.id) {
        console.log(`User ${key} disconnected.`);
        onlineUsers.delete(key);
        break;
      }
    }
  });

  socket.on("knock_user", async ({ senderId, receiverId }) => {
    try {
      const [existing] = await db.execute(
        `SELECT * FROM conversations 
         WHERE (user_one_id = ? AND user_two_id = ?) 
            OR (user_one_id = ? AND user_two_id = ?)`,
        [senderId, receiverId, receiverId, senderId]
      );

      let conversationId;
      if (existing.length > 0) {
        conversationId = existing[0].id;
      } else {
        const [result] = await db.execute(
          "INSERT INTO conversations (user_one_id, user_two_id, created_at) VALUES (?, ?, NOW())",
          [senderId, receiverId]
        );
        conversationId = result.insertId;
      }

      [senderId, receiverId].forEach((id) => {
        const socketId = onlineUsers.get(id);
        if (socketId) {
          io.to(socketId).emit("new_conversation", {
            conversationId,
            partnerId: id === senderId ? receiverId : senderId,
          });
        }
      });

    } catch (err) {
      console.error("Error handling knock:", err);
      socket.emit("knock_error", { message: "Failed to create conversation" });
    }
  });

  socket.on(
    "send_message",
    async ({ conversationId, senderId, content, timestamp }) => {
      try {
        const createdAt = timestamp || new Date();

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

        const [rows] = await db.execute(
          "SELECT user_one_id, user_two_id FROM conversations WHERE id = ?",
          [conversationId]
        );

        if (rows.length === 0) return;
        const { user_one_id, user_two_id } = rows[0];
        const receiverId = senderId === user_one_id ? user_two_id : user_one_id;

        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receive_message", messageData);
        }

        socket.emit("receive_message", messageData);

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
