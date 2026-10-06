import { Router } from 'express';
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} from '../controllers/studentController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

// List students: Admin
router.get('/', requireRole('admin'), getStudents);

// Get single student profile (admin or student self)
router.get('/:id', getStudentById);

// Admin-only mutation endpoints
router.post('/', requireRole('admin'), createStudent);
router.put('/:id', requireRole('admin'), updateStudent);
router.delete('/:id', requireRole('admin'), deleteStudent);

export default router;
