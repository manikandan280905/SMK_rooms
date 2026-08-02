import { Router } from 'express';
import { lodgeController } from './lodge.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', lodgeController.getAll);
router.get('/:id', lodgeController.getById);

export default router;
