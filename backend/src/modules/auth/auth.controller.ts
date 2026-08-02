import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { sendSuccess, sendError } from '../../utils/apiResponse';
import { verifyRefreshToken, generateAccessToken } from '../../utils/jwt';

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const ipAddress = req.ip || req.socket.remoteAddress;

      const result = await authService.login(email, password, ipAddress);

      // Set refresh token in httpOnly cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
      });

      return sendSuccess(res, {
        admin: result.admin,
        accessToken: result.accessToken,
      }, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });

      return sendSuccess(res, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies?.refreshToken || req.body?.refreshToken;

      if (!token) {
        return sendError(res, 'Refresh token not found', 401);
      }

      const payload = verifyRefreshToken(token);
      const newAccessToken = generateAccessToken({
        adminId: payload.adminId,
        email: payload.email,
        role: payload.role,
      });

      return sendSuccess(res, { accessToken: newAccessToken }, 'Token refreshed');
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        res.clearCookie('refreshToken');
        return sendError(res, 'Session expired. Please login again.', 401);
      }
      return sendError(res, 'Invalid refresh token', 401);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const admin = await authService.getProfile(req.admin!.id);
      return sendSuccess(res, admin);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
