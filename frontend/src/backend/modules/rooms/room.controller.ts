import { Request, Response, NextFunction } from 'express';
import { roomService } from './room.service';
import { sendSuccess } from '../../utils/apiResponse';

export class RoomController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const room = await roomService.create(req.body, req.admin!.id);
      return sendSuccess(res, room, 'Room created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const lodgeId = typeof req.query.lodgeId === 'string' ? req.query.lodgeId : undefined;
      const status = typeof req.query.status === 'string' ? req.query.status : undefined;
      const rooms = await roomService.getAll(lodgeId, status);
      return sendSuccess(res, rooms);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const room = await roomService.getById(id);
      return sendSuccess(res, room);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const room = await roomService.update(id, req.body, req.admin!.id);
      return sendSuccess(res, room, 'Room updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await roomService.delete(id, req.admin!.id);
      return sendSuccess(res, null, 'Room deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async getAvailable(req: Request, res: Response, next: NextFunction) {
    try {
      const lodgeId = typeof req.query.lodgeId === 'string' ? req.query.lodgeId : undefined;
      const rooms = await roomService.getAvailable(lodgeId);
      return sendSuccess(res, rooms);
    } catch (error) {
      next(error);
    }
  }
}

export const roomController = new RoomController();
