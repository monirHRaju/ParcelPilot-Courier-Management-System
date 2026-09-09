import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { redis } from '../lib/redis.js';

// Global Rate Limiter: 1000 requests per 15 minutes per IP
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes.',
  store: new RedisStore({
    // @ts-expect-error - Known typing mismatch between ioredis and rate-limit-redis
    sendCommand: (...args: string[]) => redis.call(...args),
    prefix: 'rl:global:',
  }),
});

// Auth Limiter: 10 requests per 15 minutes per IP
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many login or registration attempts. Please try again after 15 minutes.',
  store: new RedisStore({
    // @ts-expect-error
    sendCommand: (...args: string[]) => redis.call(...args),
    prefix: 'rl:auth:',
  }),
});

// Public API Limiter: 100 requests per 15 minutes per IP
export const publicApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests to public endpoints, please try again after 15 minutes.',
  store: new RedisStore({
    // @ts-expect-error
    sendCommand: (...args: string[]) => redis.call(...args),
    prefix: 'rl:public:',
  }),
});
