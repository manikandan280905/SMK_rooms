import { Request, Response, NextFunction } from 'express';
import { adminService } from './admin.service';
import { sendSuccess } from '../../utils/apiResponse';

export class AdminController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const admin = await adminService.create(req.body, req.admin!.id);
      return sendSuccess(res, admin, 'Admin created successfully', 201);
    } catch (error) { next(error); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const admin = await adminService.update(req.admin!.id, req.body, req.admin!.id);
      return sendSuccess(res, admin, 'Profile updated successfully');
    } catch (error) { next(error); }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      await adminService.changePassword(req.admin!.id, req.body);
      return sendSuccess(res, null, 'Password changed successfully');
    } catch (error) { next(error); }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const admins = await adminService.getAll();
      return sendSuccess(res, admins);
    } catch (error) { next(error); }
  }
}

export const adminController = new AdminController();
