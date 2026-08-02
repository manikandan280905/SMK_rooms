import { Request, Response, NextFunction } from 'express';
import { lodgeService } from './lodge.service';
import { sendSuccess } from '../../utils/apiResponse';

export class LodgeController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const lodges = await lodgeService.getAll();
      return sendSuccess(res, lodges);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const lodge = await lodgeService.getById(id);
      return sendSuccess(res, lodge);
    } catch (error) {
      next(error);
    }
  }
}

export const lodgeController = new LodgeController();
