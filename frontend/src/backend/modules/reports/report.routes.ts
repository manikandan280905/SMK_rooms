import { Router } from 'express';
import { reportController } from './report.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/daily', reportController.getDailyReport);
router.get('/monthly', reportController.getMonthlyReport);
router.get('/revenue', reportController.getRevenueReport);
router.get('/occupancy', reportController.getOccupancyReport);
router.get('/guest-history', reportController.getGuestHistory);
router.get('/current-guests', reportController.getCurrentGuests);
router.get('/checkout', reportController.getCheckoutReport);

export default router;
