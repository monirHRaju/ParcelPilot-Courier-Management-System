import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma.js';
import { redis } from '../../lib/redis.js';
import { AppError } from '../../errors/app-error.js';

export const publicController = {
  async trackParcel(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const parcel = await prisma.parcel.findUnique({
        where: { id },
        select: {
          id: true,
          status: true,
          riderId: true,
          statusHistory: {
            select: {
              status: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      });

      if (!parcel) {
        throw AppError.notFound('Parcel not found', 'PARCEL_NOT_FOUND');
      }

      let riderLocation = null;

      if (parcel.riderId) {
        const isOnline = await redis.get(`riders:online:${parcel.riderId}`);
        if (isOnline) {
          const positions = await redis.geopos('riders:locations', parcel.riderId);
          if (positions && positions[0]) {
            riderLocation = {
              latitude: parseFloat(positions[0][1]),
              longitude: parseFloat(positions[0][0]),
            };
          }
        }
      }

      res.status(200).json({
        id: parcel.id,
        status: parcel.status,
        statusHistory: parcel.statusHistory,
        riderLocation,
      });
    } catch (error) {
      next(error);
    }
  },
};
