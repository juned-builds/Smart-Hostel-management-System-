import { Router } from 'express';
import { getLeaves, createLeave, reviewLeave } from '../controllers/leaveController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getLeaves);
router.post('/', createLeave);
router.put('/:id', requireRole('admin'), reviewLeave);

export default router;
