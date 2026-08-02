import { Router } from 'express';
import { guestController } from './guest.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createGuestSchema, updateGuestSchema, checkoutSchema } from './guest.schema';

const router = Router();

router.use(authenticate);

router.get('/', guestController.getAll);
router.get('/:id', guestController.getById);
router.post('/', validate(createGuestSchema), guestController.create);
router.put('/:id', validate(updateGuestSchema), guestController.update);
router.delete('/:id', guestController.delete);
router.post('/:bookingId/checkout', validate(checkoutSchema), guestController.checkout);

export default router;
