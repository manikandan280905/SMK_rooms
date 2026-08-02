import { Router } from 'express';
import { uploadController } from './upload.controller';
import { authenticate } from '../../middleware/auth';
import { upload } from '../../middleware/upload';

const router = Router();

router.use(authenticate);

router.post('/', upload.single('file'), uploadController.uploadDocument);
router.get('/guest/:guestId', uploadController.getGuestDocuments);
router.delete('/:id', uploadController.deleteDocument);

export default router;
