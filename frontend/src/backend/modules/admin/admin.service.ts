import prisma from '../../config/database';
import { hashPassword, comparePassword } from '../../utils/password';
import { CreateAdminInput, UpdateAdminInput, ChangePasswordInput } from './admin.schema';
import { logActivity } from '../../utils/logger';

export class AdminService {
  async create(data: CreateAdminInput, createdBy: string) {
    const hashedPassword = await hashPassword(data.password);
    const admin = await prisma.admin.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: data.role,
        createdBy,
        updatedBy: createdBy,
      },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    await logActivity(createdBy, 'ADMIN_CREATED', 'admin', admin.id, `Admin ${data.email} created`);
    return admin;
  }

  async update(id: string, data: UpdateAdminInput, updatedBy: string) {
    const admin = await prisma.admin.update({
      where: { id },
      data: { ...data, updatedBy },
      select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true },
    });
    await logActivity(updatedBy, 'ADMIN_UPDATED', 'admin', id);
    return admin;
  }

  async changePassword(id: string, data: ChangePasswordInput) {
    const admin = await prisma.admin.findUnique({ where: { id } });
    if (!admin) {
      throw Object.assign(new Error('Admin not found'), { statusCode: 404 });
    }

    const isValid = await comparePassword(data.currentPassword, admin.password);
    if (!isValid) {
      throw Object.assign(new Error('Current password is incorrect'), { statusCode: 400 });
    }

    const hashedPassword = await hashPassword(data.newPassword);
    await prisma.admin.update({
      where: { id },
      data: { password: hashedPassword },
    });

    await logActivity(id, 'PASSWORD_CHANGED', 'admin', id);
  }

  async getAll() {
    return prisma.admin.findMany({
      select: { id: true, email: true, name: true, role: true, lastLogin: true, isActive: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const adminService = new AdminService();
