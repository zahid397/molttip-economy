const express = require('express');
const router = express.Router();
const { getNotifications, markNotificationAsRead } = require('../controllers/notification.controller');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, getNotifications);
router.patch('/:id/read', authMiddleware, markNotificationAsRead);

module.exports = router;
