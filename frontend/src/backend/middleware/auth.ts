import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { sendError } from '../utils/apiResponse';
import prisma from '../config/database';

// Extend Express Request to include admin
declare global {
  namespace Express {
    interface Request {
      admin?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    // Get token from Authorization header or cookie
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : req.cookies?.accessToken;

    if (!token) {
      return sendError(res, 'Authentication required', 401);
    }

    const payload = verifyAccessToken(token);

    // Verify admin still exists and is active
    const admin = await prisma.admin.findUnique({
      where: { id: payload.adminId },
      select: { id: true, email: true, role: true, isActive: true },
    });

    if (!admin || !admin.isActive) {
      return sendError(res, 'Account not found or deactivated', 401);
    }

    req.admin = {
      id: admin.id,
      email: admin.email,
      role: admin.role,
    };

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 'Token expired', 401);
    }
    if (error.name === 'JsonWebTokenError') {
      return sendError(res, 'Invalid token', 401);
    }
    return sendError(res, 'Authentication failed', 401);
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return sendError(res, 'Authentication required', 401);
    }
    if (!roles.includes(req.admin.role)) {
      return sendError(res, 'Insufficient permissions', 403);
    }
    next();
  };
}
