import { Router } from 'express';
import { adminController } from './admin.controller';
import { authenticate, requireRole } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createAdminSchema, updateAdminSchema, changePasswordSchema } from './admin.schema';

const router = Router();

router.use(authenticate);

router.get('/', requireRole('ADMIN'), adminController.getAll);
router.post('/', requireRole('ADMIN'), validate(createAdminSchema), adminController.create);
router.put('/profile', validate(updateAdminSchema), adminController.update);
router.put('/change-password', validate(changePasswordSchema), adminController.changePassword);

export default router;
