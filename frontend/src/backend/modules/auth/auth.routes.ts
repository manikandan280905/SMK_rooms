import { Router } from 'express';
import { authController } from './auth.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { loginLimiter } from '../../middleware/rateLimiter';
import { loginSchema } from './auth.schema';

const router = Router();

router.post('/login', loginLimiter, validate(loginSchema), authController.login);
router.post('/logout', authenticate, authController.logout);
router.post('/refresh-token', authController.refreshToken);
router.get('/me', authenticate, authController.getProfile);

export default router;
