import { Router } from 'express';
import { paymentController } from './payment.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', paymentController.getAll);
router.get('/:id', paymentController.getById);
router.put('/:id', paymentController.update);

export default router;
