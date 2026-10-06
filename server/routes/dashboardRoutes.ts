import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.get('/stats', requireRole('admin'), getDashboardStats);

export default router;
