import { Request, Response, NextFunction } from 'express';
import prisma from '../../config/database';
import { sendSuccess } from '../../utils/apiResponse';

export class SettingsController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await prisma.settings.findMany();
      const settingsMap: Record<string, string> = {};
      settings.forEach((s) => { settingsMap[s.key] = s.value; });
      return sendSuccess(res, settingsMap);
    } catch (error) { next(error); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const updates = req.body as Record<string, string>;
      for (const [key, value] of Object.entries(updates)) {
        await prisma.settings.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        });
      }
      return sendSuccess(res, updates, 'Settings updated successfully');
    } catch (error) { next(error); }
  }
}

export const settingsController = new SettingsController();
