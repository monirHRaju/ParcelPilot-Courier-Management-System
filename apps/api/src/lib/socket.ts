import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { redis } from './redis.js';
import { verifyAccessToken } from '../middleware/authenticate.js';
import { riderService } from '../modules/rider/rider.service.js';
import { prisma } from './prisma.js';
import { logger } from './logger.js';
import http from 'http';

// Module-level singleton — set once by initSocket(), accessed by getIO()
let ioInstance: Server | null = null;

/**
 * Returns the Socket.IO Server instance.
 * Must be called after initSocket() has been invoked (i.e. after server startup).
 * Services call this at invocation time, not import time, to avoid circular deps.
 */
export const getIO = (): Server => {
  if (!ioInstance) {
    throw new Error('Socket.IO not initialized — getIO() called before initSocket()');
  }
  return ioInstance;
};

export const initSocket = (server: http.Server) => {
  const pubClient = redis.duplicate();
  const subClient = redis.duplicate();

  // Connect them since redis is using lazyConnect: true
  pubClient.connect().catch(err => logger.error({err}, 'Socket Redis Pub Connect Error'));
  subClient.connect().catch(err => logger.error({err}, 'Socket Redis Sub Connect Error'));

  const io = new Server(server, {
    cors: {
      origin: '*', // Allow all origins for local dev
    },
  });

  io.adapter(createAdapter(pubClient, subClient));

  // Store in module-level singleton for getIO()
  ioInstance = io;

  // Default Namespace (Authenticated)
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Missing token'));
    }

    try {
      const payload = await verifyAccessToken(token);
      socket.data = { userId: payload.userId, role: payload.role };
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    socket.join(`user:${userId}`);
    socket.emit('connected', { success: true, userId, role: socket.data.role });

    socket.on('rider:location', async (data: { latitude: number; longitude: number }) => {
      if (socket.data.role !== 'RIDER') return;

      const { latitude, longitude } = data;
      if (typeof latitude !== 'number' || typeof longitude !== 'number') return;

      const throttleKey = `locationThrottle:${userId}`;
      const set = await redis.set(throttleKey, '1', 'EX', 5, 'NX');
      if (!set) return; // Throttled

      try {
        const rider = await riderService.updateLocation(userId, latitude, longitude);
        
        const activeParcels = await prisma.parcel.findMany({
          where: {
            riderId: rider.id,
            status: { in: ['PICKED_UP', 'OUT_FOR_DELIVERY'] },
          },
          select: { id: true },
        });

        if (activeParcels.length === 0) return;

        const payload = {
          riderId: rider.id,
          latitude,
          longitude,
          timestamp: new Date().toISOString(),
        };

        for (const parcel of activeParcels) {
          const roomName = `parcel:${parcel.id}`;
          // Emit to default namespace
          io.to(roomName).emit('location:update', payload);
          // Emit to tracking namespace
          io.of('/tracking').to(roomName).emit('location:update', payload);
        }
      } catch (error) {
        logger.error({ error }, 'Error in rider:location socket handler');
      }
    });
  });

  // Tracking Namespace (Anonymous)
  const trackingNamespace = io.of('/tracking');
  
  trackingNamespace.on('connection', (socket) => {
    socket.on('join_room', (roomId: string) => {
      if (typeof roomId === 'string' && roomId.startsWith('parcel:')) {
        socket.join(roomId);
      }
    });
  });

  return io;
};
