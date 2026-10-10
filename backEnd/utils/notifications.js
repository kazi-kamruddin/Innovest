const db = require('../config/database');

async function createNotification({ userId, actorId, kind, text, targetPath, io, executor = db }) {
  if (Number(userId) === Number(actorId)) return null;
  const [result] = await executor.execute(
    `INSERT INTO user_notifications (user_id, actor_id, kind, text, target_path)
     VALUES (?, ?, ?, ?, ?)`,
    [userId, actorId, kind, text, targetPath]
  );
  const notification = {
    id: result.insertId,
    user_id: userId,
    actor_id: actorId,
    kind,
    text,
    target_path: targetPath,
    created_at: new Date().toISOString(),
    read_at: null,
  };
  if (io) io.to(`user:${userId}`).emit('notification', notification);
  return notification;
}

async function notifyBestEffort(details) {
  try {
    return await createNotification(details);
  } catch (error) {
    console.error('Notification creation failed:', error);
    return null;
  }
}

module.exports = { createNotification, notifyBestEffort };
