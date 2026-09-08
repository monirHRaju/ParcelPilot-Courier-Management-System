import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { notificationController } from './notification.controller.js';

const router = Router();

// All notification routes require authentication
router.use(authenticate);

router.get('/mine', notificationController.getMyNotifications);
router.patch('/:id/read', notificationController.markAsRead);

export const notificationRouter = router;
