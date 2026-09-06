import argon2 from 'argon2';
import { SignJWT, jwtVerify } from 'jose';
import crypto from 'crypto';
import { prisma } from '../../lib/prisma.js';
import { redis } from '../../lib/redis.js';
import { env } from '../../config/env.js';
import { AppError } from '../../errors/app-error.js';
import { Role } from '@prisma/client';

const accessSecret = new TextEncoder().encode(env.JWT_ACCESS_SECRET);
const refreshSecret = new TextEncoder().encode(env.JWT_REFRESH_SECRET);
const alg = 'HS256';

export class AuthService {
  static async register(phone: string, passwordPlain: string, role: Role) {
    const existing = await prisma.user.findUnique({ where: { phone } });
    if (existing) {
      throw AppError.badRequest('Phone number already in use', 'USER_ALREADY_EXISTS');
    }

    const passwordHash = await argon2.hash(passwordPlain);
    const user = await prisma.user.create({
      data: { phone, passwordHash, role },
    });

    return this.generateTokens(user.id, user.role);
  }

  static async login(phone: string, passwordPlain: string) {
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      throw AppError.unauthorized('Invalid phone or password', 'INVALID_CREDENTIALS');
    }

    const isValid = await argon2.verify(user.passwordHash, passwordPlain);
    if (!isValid) {
      throw AppError.unauthorized('Invalid phone or password', 'INVALID_CREDENTIALS');
    }

    if (!user.isActive) {
      throw AppError.unauthorized('User is deactivated', 'USER_DEACTIVATED');
    }

    return this.generateTokens(user.id, user.role);
  }

  static async generateTokens(userId: string, role: string) {
    const jti = crypto.randomUUID();

    const accessToken = await new SignJWT({ userId, role })
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setExpirationTime('15m')
      .sign(accessSecret);

    const refreshToken = await new SignJWT({ userId, role })
      .setProtectedHeader({ alg })
      .setJti(jti)
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(refreshSecret);

    // Store in redis for revocation (expires in 7 days = 604800 seconds)
    await redis.set(`auth:refresh:${jti}`, userId, 'EX', 7 * 24 * 60 * 60);

    return { accessToken, refreshToken };
  }

  static async refresh(refreshToken: string) {
    try {
      const { payload } = await jwtVerify(refreshToken, refreshSecret);
      
      const jti = payload.jti;
      if (!jti) {
        throw AppError.unauthorized('Invalid token', 'INVALID_TOKEN');
      }

      // Check redis
      const userIdFromRedis = await redis.get(`auth:refresh:${jti}`);
      if (!userIdFromRedis || userIdFromRedis !== payload.userId) {
        throw AppError.unauthorized('Token revoked or expired', 'TOKEN_REVOKED');
      }

      // Delete old token
      await redis.del(`auth:refresh:${jti}`);

      // Issue new ones
      return this.generateTokens(payload.userId as string, payload.role as string);
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw AppError.unauthorized('Invalid token', 'INVALID_TOKEN');
    }
  }

  static async logout(refreshToken: string) {
    try {
      const { payload } = await jwtVerify(refreshToken, refreshSecret);
      const jti = payload.jti;
      if (jti) {
        await redis.del(`auth:refresh:${jti}`);
      }
    } catch (err) {
      // Ignore if token is already expired or invalid on logout
    }
  }
}
