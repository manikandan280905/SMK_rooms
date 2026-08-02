import { Router } from 'express';
import { settingsController } from './settings.controller';
import { authenticate, requireRole } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', settingsController.getAll);
router.put('/', requireRole('ADMIN'), settingsController.update);

export default router;
