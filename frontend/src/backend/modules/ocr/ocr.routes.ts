import { Router } from 'express';
import multer from 'multer';
import { ocrController } from './ocr.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// OCR-specific multer — memory storage, supports images + PDFs, up to 10MB
const ocrUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB — larger limit needed for PDFs
  },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'application/pdf',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, WEBP images and PDF files are allowed for OCR.'));
    }
  },
});

// GET /api/ocr — status check
router.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'SMK Rooms AI OCR API is running. Send POST request to /api/ocr/extract to scan handwritten register pages.',
  });
});

// GET /api/ocr/extract — helpful usage info for GET requests
router.get('/extract', (_req, res) => {
  res.json({
    success: true,
    message: 'OCR extract endpoint accepts POST multipart/form-data with a "file" field containing a register photo or PDF.',
  });
});

// POST /api/ocr/extract — upload a register notebook photo and extract guest data
router.post('/extract', authenticate, ocrUpload.single('file'), ocrController.extractDocument);

export default router;
