import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { authLimiter } from '../../middleware/rate-limiter.js';

const router = Router();

router.post('/register', authLimiter, AuthController.register);
router.post('/login', authLimiter, AuthController.login);
router.post('/refresh', AuthController.refresh);
router.post('/logout', AuthController.logout);
router.post('/otp/send', authLimiter, AuthController.sendOtp);
router.post('/otp/verify', authLimiter, AuthController.verifyOtp);

export const authRouter = router;
