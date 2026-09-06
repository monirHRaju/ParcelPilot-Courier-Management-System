import { Request, Response, NextFunction } from 'express';
import { jwtVerify } from 'jose';
import { env } from '../config/env.js';
import { AppError } from '../errors/app-error.js';

const accessSecret = new TextEncoder().encode(env.JWT_ACCESS_SECRET);

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw AppError.unauthorized('Missing or invalid token', 'UNAUTHORIZED');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw AppError.unauthorized('Missing or invalid token', 'UNAUTHORIZED');
    }

    const { payload } = await jwtVerify(token, accessSecret);
    
    // Attach payload to request
    (req as any).user = {
      id: payload.userId as string,
      role: payload.role as string,
      ...payload
    };
    
    next();
  } catch (err) {
    next(AppError.unauthorized('Invalid or expired token', 'UNAUTHORIZED'));
  }
};
