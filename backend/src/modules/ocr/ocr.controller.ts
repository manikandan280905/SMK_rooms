import { Request, Response, NextFunction } from 'express';
import { extractGuestDataFromDocument } from './ocr.service';
import { sendSuccess, sendError } from '../../utils/apiResponse';
import { env } from '../../config/env';

// Allowed MIME types for OCR uploads
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf',
];

export class OcrController {
  /**
   * POST /api/ocr/extract
   *
   * Accepts a document image or PDF, sends it to Gemini Flash,
   * and returns structured guest data for auto-populating the check-in form.
   */
  async extractDocument(req: Request, res: Response, next: NextFunction) {
    try {
      // Check if Gemini API key is configured
      if (!env.GEMINI_API_KEY) {
        return sendError(
          res,
          'OCR service is not configured. Please add GEMINI_API_KEY to your environment variables.',
          503
        );
      }

      // Validate file upload
      if (!req.file) {
        return sendError(res, 'No file uploaded. Please upload an image or PDF.', 400);
      }

      const { mimetype, buffer, size } = req.file;

      // Validate MIME type
      if (!ALLOWED_MIME_TYPES.includes(mimetype)) {
        return sendError(
          res,
          `Unsupported file type: ${mimetype}. Allowed: JPG, PNG, WEBP, PDF.`,
          400
        );
      }

      // Validate file size — 10MB max for OCR (larger than regular upload limit)
      const maxSize = 10 * 1024 * 1024;
      if (size > maxSize) {
        return sendError(res, 'File too large. Maximum size for OCR is 10MB.', 400);
      }

      // Run OCR extraction via Gemini Flash
      const result = await extractGuestDataFromDocument(buffer, mimetype);

      return sendSuccess(res, result, 'OCR extraction completed successfully');
    } catch (error: any) {
      // Handle specific Gemini API errors gracefully
      if (error.message?.includes('GEMINI_API_KEY')) {
        return sendError(res, error.message, 503);
      }
      if (error.message?.includes('Gemini API error')) {
        return sendError(res, `OCR processing failed: ${error.message}`, 502);
      }
      if (error.message?.includes('blocked')) {
        return sendError(res, 'Document image was rejected by OCR service. Please use a clear, unobstructed photo.', 422);
      }
      next(error);
    }
  }
}

export const ocrController = new OcrController();
