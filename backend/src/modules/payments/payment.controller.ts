import { Request, Response, NextFunction } from 'express';
import { paymentService } from './payment.service';
import { sendSuccess, sendPaginated } from '../../utils/apiResponse';
import { parsePagination } from '../../utils/pagination';

export class PaymentController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip } = parsePagination(req.query);
      const { status, method, dateFrom, dateTo } = req.query;
      const { payments, total } = await paymentService.getAll({
        page, limit, skip,
        status: typeof status === 'string' ? status : undefined,
        method: typeof method === 'string' ? method : undefined,
        dateFrom: typeof dateFrom === 'string' ? dateFrom : undefined,
        dateTo: typeof dateTo === 'string' ? dateTo : undefined,
      });
      return sendPaginated(res, payments, { page, limit, total });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const payment = await paymentService.getById(id);
      return sendSuccess(res, payment);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const payment = await paymentService.update(id, req.body, req.admin!.id);
      return sendSuccess(res, payment, 'Payment updated successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const paymentController = new PaymentController();
