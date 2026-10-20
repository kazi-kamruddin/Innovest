const jwt = require('jsonwebtoken');
const { verifyAccessToken, hashToken } = require('../utils/authTokens');

async function authenticateSocket(socket, next) {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));
    socket.data.userId = await verifyAccessToken(token);
    socket.data.tokenHash = hashToken(token);
    socket.data.expiresAt = Number(jwt.decode(token).exp) * 1000;
    if (!Number.isFinite(socket.data.expiresAt)) return next(new Error('Invalid or expired token'));
    next();
  } catch {
    next(new Error('Invalid or expired token'));
  }
}

function protectSocketSession(socket) {
  // Expired sockets must stop receiving private events as well as sending them.
  const timer = setTimeout(() => socket.disconnect(true), Math.max(0, socket.data.expiresAt - Date.now()));
  timer.unref?.();
  socket.once('disconnect', () => clearTimeout(timer));
  socket.use(async ([event], next) => {
    try {
      const userId = await verifyAccessToken(socket.handshake.auth.token);
      if (userId !== socket.data.userId) throw new Error('Invalid token');
      next();
    } catch {
      // Drop this packet before its handler can access the conversation.
      if (event === 'send_message' || event === 'knock_user') {
        socket.emit(event === 'knock_user' ? 'knock_error' : 'send_message_error', {
          message: 'Your session is unavailable or expired. Please sign in again.',
        });
      }
      socket.disconnect(true);
    }
  });
}

module.exports = { authenticateSocket, protectSocketSession };
