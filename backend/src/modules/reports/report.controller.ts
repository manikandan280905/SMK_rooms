import { Request, Response, NextFunction } from 'express';
import { reportService } from './report.service';
import { sendSuccess } from '../../utils/apiResponse';

export class ReportController {
  async getDailyReport(req: Request, res: Response, next: NextFunction) {
    try {
      const date = (req.query.date as string) || new Date().toISOString().slice(0, 10);
      const lodgeId = typeof req.query.lodgeId === 'string' ? req.query.lodgeId : undefined;
      const data = await reportService.getDailyReport(date, lodgeId);
      return sendSuccess(res, data);
    } catch (error) { next(error); }
  }

  async getMonthlyReport(req: Request, res: Response, next: NextFunction) {
    try {
      const now = new Date();
      const year = parseInt(req.query.year as string) || now.getFullYear();
      const month = parseInt(req.query.month as string) || (now.getMonth() + 1);
      const lodgeId = typeof req.query.lodgeId === 'string' ? req.query.lodgeId : undefined;
      const data = await reportService.getMonthlyReport(year, month, lodgeId);
      return sendSuccess(res, data);
    } catch (error) { next(error); }
  }

  async getRevenueReport(req: Request, res: Response, next: NextFunction) {
    try {
      const dateFrom = req.query.dateFrom as string;
      const dateTo = req.query.dateTo as string;
      const lodgeId = typeof req.query.lodgeId === 'string' ? req.query.lodgeId : undefined;
      if (!dateFrom || !dateTo) {
        return res.status(400).json({ success: false, message: 'dateFrom and dateTo are required' });
      }
      const data = await reportService.getRevenueReport(dateFrom, dateTo, lodgeId);
      return sendSuccess(res, data);
    } catch (error) { next(error); }
  }

  async getOccupancyReport(req: Request, res: Response, next: NextFunction) {
    try {
      const lodgeId = typeof req.query.lodgeId === 'string' ? req.query.lodgeId : undefined;
      const data = await reportService.getOccupancyReport(lodgeId);
      return sendSuccess(res, data);
    } catch (error) { next(error); }
  }

  async getPendingPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const lodgeId = typeof req.query.lodgeId === 'string' ? req.query.lodgeId : undefined;
      const data = await reportService.getPendingPayments(lodgeId);
      return sendSuccess(res, data);
    } catch (error) { next(error); }
  }

  async getGuestHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const lodgeId = typeof req.query.lodgeId === 'string' ? req.query.lodgeId : undefined;
      const data = await reportService.getGuestHistory(
        req.query.dateFrom as string,
        req.query.dateTo as string,
        lodgeId
      );
      return sendSuccess(res, data);
    } catch (error) { next(error); }
  }

  async getCurrentGuests(req: Request, res: Response, next: NextFunction) {
    try {
      const lodgeId = typeof req.query.lodgeId === 'string' ? req.query.lodgeId : undefined;
      const data = await reportService.getCurrentGuests(lodgeId);
      return sendSuccess(res, data);
    } catch (error) { next(error); }
  }

  async getCheckoutReport(req: Request, res: Response, next: NextFunction) {
    try {
      const dateFrom = req.query.dateFrom as string;
      const dateTo = req.query.dateTo as string;
      const lodgeId = typeof req.query.lodgeId === 'string' ? req.query.lodgeId : undefined;
      if (!dateFrom || !dateTo) {
        return res.status(400).json({ success: false, message: 'dateFrom and dateTo are required' });
      }
      const data = await reportService.getCheckoutReport(dateFrom, dateTo, lodgeId);
      return sendSuccess(res, data);
    } catch (error) { next(error); }
  }
}

export const reportController = new ReportController();
