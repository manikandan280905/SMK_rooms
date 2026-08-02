import { Router } from 'express';
import { roomController } from './room.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createRoomSchema, updateRoomSchema } from './room.schema';

const router = Router();

router.use(authenticate);

router.get('/', roomController.getAll);
router.get('/available', roomController.getAvailable);
router.get('/:id', roomController.getById);
router.post('/', validate(createRoomSchema), roomController.create);
router.put('/:id', validate(updateRoomSchema), roomController.update);
router.delete('/:id', roomController.delete);

export default router;
