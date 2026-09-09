import { prisma } from './prisma.js';
import { logger } from './logger.js';

export async function createAuditLog({
  userId,
  entityType,
  entityId,
  action,
  changes,
}: {
  userId: string;
  entityType: string;
  entityId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  changes?: Record<string, any>;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        entityType,
        entityId,
        action,
        changes: changes ? JSON.stringify(changes) : undefined,
      },
    });
  } catch (error) {
    // We don't want audit log failures to break the main transaction,
    // so we log it and swallow the error.
    logger.error({ error, entityType, entityId }, 'Failed to write audit log');
  }
}
