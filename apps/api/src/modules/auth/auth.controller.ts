import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service.js';
import { registerSchema, loginSchema, refreshSchema, logoutSchema, sendOtpSchema, verifyOtpSchema } from './auth.schemas.js';
import { AppError } from '../../errors/app-error.js';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        throw AppError.badRequest('Validation failed', 'VALIDATION_ERROR', parsed.error.format());
      }

      const { phone, password, role } = parsed.data;
      const tokens = await AuthService.register(phone, password, role);

      res.status(201).json({
        message: 'Registration successful',
        ...tokens,
      });
    } catch (err) {
      next(err);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        throw AppError.badRequest('Validation failed', 'VALIDATION_ERROR', parsed.error.format());
      }

      const { phone, password } = parsed.data;
      const tokens = await AuthService.login(phone, password);

      res.status(200).json({
        message: 'Login successful',
        ...tokens,
      });
    } catch (err) {
      next(err);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = refreshSchema.safeParse(req.body);
      if (!parsed.success) {
        throw AppError.badRequest('Validation failed', 'VALIDATION_ERROR', parsed.error.format());
      }

      const { refreshToken } = parsed.data;
      const tokens = await AuthService.refresh(refreshToken);

      res.status(200).json({
        message: 'Token refreshed',
        ...tokens,
      });
    } catch (err) {
      next(err);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = logoutSchema.safeParse(req.body);
      if (!parsed.success) {
        throw AppError.badRequest('Validation failed', 'VALIDATION_ERROR', parsed.error.format());
      }

      const { refreshToken } = parsed.data;
      await AuthService.logout(refreshToken);

      res.status(200).json({
        message: 'Logout successful',
      });
    } catch (err) {
      next(err);
    }
  }

  static async sendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = sendOtpSchema.safeParse(req.body);
      if (!parsed.success) {
        throw AppError.badRequest('Validation failed', 'VALIDATION_ERROR', parsed.error.format());
      }

      const { phone } = parsed.data;
      await AuthService.sendOtp(phone);

      res.status(200).json({
        message: 'OTP sent successfully',
      });
    } catch (err) {
      next(err);
    }
  }

  static async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = verifyOtpSchema.safeParse(req.body);
      if (!parsed.success) {
        throw AppError.badRequest('Validation failed', 'VALIDATION_ERROR', parsed.error.format());
      }

      const { phone, code } = parsed.data;
      await AuthService.verifyOtp(phone, code);

      res.status(200).json({
        message: 'Phone verified successfully',
      });
    } catch (err) {
      next(err);
    }
  }
}

