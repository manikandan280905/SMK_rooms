import { Request, Response, NextFunction } from 'express';
import { dashboardService } from './dashboard.service';
import { sendSuccess } from '../../utils/apiResponse';

export class DashboardController {
  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const lodgeId = typeof req.query.lodgeId === 'string' ? req.query.lodgeId : undefined;
      const data = await dashboardService.getDashboardData(lodgeId);
      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
