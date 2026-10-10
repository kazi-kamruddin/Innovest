const db = require('../config/database');

const listNotifications = async (req, res) => {
  try {
    const [items] = await db.execute(
      `SELECT id, kind, text, target_path, created_at, read_at
       FROM user_notifications WHERE user_id = ?
       ORDER BY created_at DESC, id DESC LIMIT 50`,
      [req.user.id]
    );
    const [[count]] = await db.execute(
      'SELECT COUNT(*) AS unread FROM user_notifications WHERE user_id = ? AND read_at IS NULL',
      [req.user.id]
    );
    res.json({ items, unread: count.unread });
  } catch (error) {
    console.error('Failed to list notifications:', error);
    res.status(500).json({ error: 'Failed to load notifications' });
  }
};

const markRead = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid notification' });
    const [result] = await db.execute(
      'UPDATE user_notifications SET read_at = COALESCE(read_at, NOW()) WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );
    if (!result.affectedRows) return res.status(404).json({ error: 'Notification not found' });
    res.json({ ok: true });
  } catch (error) {
    console.error('Failed to mark notification read:', error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
};

const markAllRead = async (req, res) => {
  try {
    await db.execute(
      'UPDATE user_notifications SET read_at = NOW() WHERE user_id = ? AND read_at IS NULL',
      [req.user.id]
    );
    res.json({ ok: true });
  } catch (error) {
    console.error('Failed to mark notifications read:', error);
    res.status(500).json({ error: 'Failed to update notifications' });
  }
};

module.exports = { listNotifications, markRead, markAllRead };
