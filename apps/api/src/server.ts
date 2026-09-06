import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './lib/logger.js';
import { prisma } from './lib/prisma.js';
import { redis } from './lib/redis.js';

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 [API Server] Running on http://localhost:${env.PORT} in ${env.NODE_ENV} mode`);
});

const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);

  server.close(async () => {
    logger.info('HTTP server closed.');

    try {
      await prisma.$disconnect();
      logger.info('Prisma database client disconnected.');
    } catch (err) {
      logger.error({ err }, 'Error disconnecting Prisma');
    }

    try {
      redis.disconnect();
      logger.info('Redis client disconnected.');
    } catch (err) {
      logger.error({ err }, 'Error disconnecting Redis');
    }

    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Forcefully shutting down after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
