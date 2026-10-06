import { Router } from 'express';
import {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  allocateStudent,
  deallocateStudent,
} from '../controllers/roomController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

// Public to authenticated users (e.g. view room lists)
router.get('/', getRooms);
router.get('/:id', getRoomById);

// Admin only room mutations
router.post('/', requireRole('admin'), createRoom);
router.put('/:id', requireRole('admin'), updateRoom);
router.delete('/:id', requireRole('admin'), deleteRoom);

export default router;

// Also export allocation router
export const allocationRouter = Router();
allocationRouter.use(authenticate, requireRole('admin'));
allocationRouter.post('/', allocateStudent);
allocationRouter.post('/deallocate', deallocateStudent);
