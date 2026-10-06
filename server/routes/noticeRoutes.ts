import { Router } from 'express';
import {
  getNotices,
  createNotice,
  updateNotice,
  deleteNotice,
} from '../controllers/noticeController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getNotices);
router.post('/', requireRole('admin'), createNotice);
router.put('/:id', requireRole('admin'), updateNotice);
router.delete('/:id', requireRole('admin'), deleteNotice);

export default router;
