import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app-error.js';
import { Role } from '@prisma/client';

export const authorize = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    
    if (!user) {
      return next(AppError.unauthorized('User not authenticated', 'UNAUTHORIZED'));
    }

    if (roles.length > 0 && !roles.includes(user.role as Role)) {
      return next(AppError.forbidden('You do not have permission to perform this action', 'FORBIDDEN'));
    }

    next();
  };
};
