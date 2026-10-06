import { Router } from 'express';
import {
  getComplaints,
  createComplaint,
  updateComplaintStatus,
} from '../controllers/complaintController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getComplaints);
router.post('/', createComplaint);
router.put('/:id', requireRole('admin'), updateComplaintStatus);

export default router;
