import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { notificationController } from './notification.controller.js';

const router = Router();

// All notification routes require authentication
router.use(authenticate);

// GET /notifications/mine?page=1&limit=20 — paginated notification list
router.get('/mine', notificationController.getMyNotifications);

// GET /notifications/mine/unread-count — for the navbar bell badge
router.get('/mine/unread-count', notificationController.getUnreadCount);

// PATCH /notifications/read-all — mark all notifications as read
router.patch('/read-all', notificationController.markAllAsRead);

// PATCH /notifications/:id/read — mark a single notification as read
router.patch('/:id/read', notificationController.markAsRead);

export const notificationRouter = router;
