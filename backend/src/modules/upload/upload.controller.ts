import { Request, Response, NextFunction } from 'express';
import cloudinary from '../../config/cloudinary';
import prisma from '../../config/database';
import { sendSuccess, sendError } from '../../utils/apiResponse';

export class UploadController {
  async uploadDocument(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return sendError(res, 'No file uploaded', 400);
      }

      const { guestId, documentType } = req.body;

      if (!guestId || !documentType) {
        return sendError(res, 'guestId and documentType are required', 400);
      }

      // Upload to Cloudinary
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;

      const result = await cloudinary.uploader.upload(dataURI, {
        folder: `smk-rooms/${String(documentType).toLowerCase()}`,
        resource_type: 'image',
      });

      // Save to database
      const document = await prisma.guestDocument.create({
        data: {
          guestId: String(guestId),
          documentType: documentType as any,
          fileUrl: result.secure_url,
          cloudinaryPublicId: result.public_id,
        },
      });

      return sendSuccess(res, document, 'File uploaded successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async deleteDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const document = await prisma.guestDocument.findUnique({ where: { id } });

      if (!document) {
        return sendError(res, 'Document not found', 404);
      }

      // Delete from Cloudinary
      if (document.cloudinaryPublicId) {
        await cloudinary.uploader.destroy(document.cloudinaryPublicId);
      }

      // Delete from database
      await prisma.guestDocument.delete({ where: { id } });

      return sendSuccess(res, null, 'Document deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async getGuestDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      const guestId = Array.isArray(req.params.guestId) ? req.params.guestId[0] : req.params.guestId;
      const documents = await prisma.guestDocument.findMany({
        where: { guestId },
        orderBy: { createdAt: 'desc' },
      });
      return sendSuccess(res, documents);
    } catch (error) {
      next(error);
    }
  }
}

export const uploadController = new UploadController();
