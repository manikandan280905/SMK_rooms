import prisma from '../../config/database';
import { comparePassword } from '../../utils/password';
import { generateAccessToken, generateRefreshToken } from '../../utils/jwt';
import { logActivity } from '../../utils/logger';

export class AuthService {
  async login(email: string, password: string, ipAddress?: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const admin = await prisma.admin.findUnique({
      where: { email: normalizedEmail },
    });

    if (!admin) {
      throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
    }

    if (!admin.isActive) {
      throw Object.assign(new Error('Account is deactivated'), { statusCode: 401 });
    }

    const isValidPassword = await comparePassword(password, admin.password);
    if (!isValidPassword) {
      await logActivity(admin.id, 'LOGIN_FAILED', 'auth', undefined, 'Invalid password', ipAddress);
      throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
    }

    // Update last login
    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLogin: new Date() },
    });

    const tokenPayload = {
      adminId: admin.id,
      email: admin.email,
      role: admin.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await logActivity(admin.id, 'LOGIN_SUCCESS', 'auth', undefined, undefined, ipAddress);

    return {
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        lastLogin: admin.lastLogin,
      },
      accessToken,
      refreshToken,
    };
  }

  async getProfile(adminId: string) {
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        lastLogin: true,
        createdAt: true,
      },
    });

    if (!admin) {
      throw Object.assign(new Error('Admin not found'), { statusCode: 404 });
    }

    return admin;
  }
}

export const authService = new AuthService();
