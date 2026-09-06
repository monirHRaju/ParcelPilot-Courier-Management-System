import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { AppError } from '../errors/app-error.js';
import { logger } from '../lib/logger.js';
import { env } from '../config/env.js';

export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    if (!err.isOperational) {
      logger.error({ err }, `Non-operational AppError: ${err.message}`);
    } else {
      logger.warn({ err }, `Operational error [${err.code}]: ${err.message}`);
    }

    res.status(err.statusCode).json({
      error: {
        message: err.message,
        code: err.code,
        ...(err.details ? { details: err.details } : {}),
      },
    });
    return;
  }

  // Unexpected errors
  logger.error({ err }, 'Unhandled application error');

  const message =
    env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err instanceof Error
        ? err.message
        : 'Unknown error';

  res.status(500).json({
    error: {
      message,
      code: 'INTERNAL_SERVER_ERROR',
    },
  });
};
