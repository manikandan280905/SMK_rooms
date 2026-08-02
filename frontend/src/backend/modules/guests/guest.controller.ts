import { Request, Response, NextFunction } from 'express';
import { guestService } from './guest.service';
import { sendSuccess, sendPaginated } from '../../utils/apiResponse';
import { parsePagination } from '../../utils/pagination';

export class GuestController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const guest = await guestService.create(req.body, req.admin!.id);
      return sendSuccess(res, guest, 'Guest registered successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip } = parsePagination(req.query);
      const { lodgeId, search, status, roomType, dateFrom, dateTo } = req.query;

      const { guests, total } = await guestService.getAll({
        page,
        limit,
        skip,
        lodgeId: typeof lodgeId === 'string' ? lodgeId : undefined,
        search: typeof search === 'string' ? search : undefined,
        status: typeof status === 'string' ? status : undefined,
        roomType: typeof roomType === 'string' ? roomType : undefined,
        dateFrom: typeof dateFrom === 'string' ? dateFrom : undefined,
        dateTo: typeof dateTo === 'string' ? dateTo : undefined,
      });

      return sendPaginated(res, guests, { page, limit, total });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const guest = await guestService.getById(id);
      return sendSuccess(res, guest);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const guest = await guestService.update(id, req.body, req.admin!.id);
      return sendSuccess(res, guest, 'Guest updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await guestService.delete(id, req.admin!.id);
      return sendSuccess(res, null, 'Guest deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async checkout(req: Request, res: Response, next: NextFunction) {
    try {
      const bookingId = Array.isArray(req.params.bookingId) ? req.params.bookingId[0] : req.params.bookingId;
      const result = await guestService.checkout(bookingId, req.body, req.admin!.id);
      return sendSuccess(res, result, 'Guest checked out successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const guestController = new GuestController();
