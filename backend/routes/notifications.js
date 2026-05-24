const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Fetch notifications
router.get('/', notificationController.getNotifications);

// Mark all as read
router.put('/read-all', notificationController.markAllAsRead);

// Mark single as read
router.put('/:id/read', notificationController.markAsRead);

module.exports = router;
