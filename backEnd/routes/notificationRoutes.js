const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const { listNotifications, markRead, markAllRead } = require('../controllers/notificationController');

const router = express.Router();
router.param('id', require('../middleware/validateId'));
router.use(requireAuth);
router.get('/', listNotifications);
router.patch('/read-all', markAllRead);
router.patch('/:id/read', markRead);
module.exports = router;
