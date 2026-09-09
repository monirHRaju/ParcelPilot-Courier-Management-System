import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { smsQueue, notificationQueue, emailQueue } from './queue.js';

/**
 * Centralized Bull Board adapter registry.
 * Add a new BullMQAdapter here to automatically include it in the dashboard
 * without touching app.ts.
 */
export const bullBoardAdapters = [
  new BullMQAdapter(smsQueue),
  new BullMQAdapter(notificationQueue),
  new BullMQAdapter(emailQueue),
];
