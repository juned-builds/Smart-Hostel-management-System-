import { Router } from 'express';
import { getFees, createFee, updateFee, payFee } from '../controllers/feeController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getFees);
router.post('/', requireRole('admin'), createFee);
router.put('/:id', requireRole('admin'), updateFee);
router.post('/:id/pay', payFee);

export default router;
