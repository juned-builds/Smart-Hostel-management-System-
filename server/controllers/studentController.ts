import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { Student } from '../models/Student.js';
import { User } from '../models/User.js';
import { Room } from '../models/Room.js';
import { AuthRequest } from '../middleware/auth.js';

// GET /api/students - List students with search, filters, pagination
export async function getStudents(req: Request, res: Response) {
  try {
    const { search, department, semester, allocationStatus, isActive, page = '1', limit = '50' } = req.query;

    const query: any = {};

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (department && department !== 'All') {
      query.department = department;
    }

    if (semester && semester !== 'All') {
      query.semester = Number(semester);
    }

    if (allocationStatus === 'allocated') {
      query.roomId = { $ne: null };
    } else if (allocationStatus === 'unallocated') {
      query.roomId = null;
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { fullName: searchRegex },
        { enrollmentNo: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ];
    }

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.max(1, parseInt(limit as string, 10));
    const skip = (pageNum - 1) * limitNum;

    const [students, total] = await Promise.all([
      Student.find(query)
        .populate('roomId', 'roomNumber block floor capacity occupied status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Student.countDocuments(query),
    ]);

    return res.json({
      success: true,
      data: students,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('getStudents error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch students.', error: error.message });
  }
}

// GET /api/students/:id - Get student details & roommates
export async function getStudentById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid student ID.' });
    }

    // Role check: If student role, they can only view their own profile
    if (req.user?.role === 'student' && req.user?.studentId !== id) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to student record.' });
    }

    const student = await Student.findById(id).populate('roomId');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    let roommates: any[] = [];
    if (student.roomId) {
      roommates = await Student.find({
        roomId: student.roomId,
        _id: { $ne: student._id },
        isActive: true,
      })
        .select('fullName enrollmentNo phone department semester email')
        .lean();
    }

    return res.json({
      success: true,
      data: {
        student,
        roommates,
      },
    });
  } catch (error: any) {
    console.error('getStudentById error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch student details.', error: error.message });
  }
}

// POST /api/students - Add new student (Admin)
export async function createStudent(req: Request, res: Response) {
  try {
    const {
      fullName,
      enrollmentNo,
      email,
      phone,
      department,
      semester,
      gender,
      guardianName,
      guardianPhone,
      address,
      password = 'student123',
    } = req.body;

    if (!fullName || !enrollmentNo || !email || !phone) {
      return res.status(400).json({ success: false, message: 'Please provide full name, enrollment no, email, and phone.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedEnrollment = enrollmentNo.toUpperCase().trim();

    // Check duplicate email or enrollment
    const [existingEmail, existingEnrollment] = await Promise.all([
      User.findOne({ email: normalizedEmail }),
      Student.findOne({ enrollmentNo: normalizedEnrollment }),
    ]);

    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
    }
    if (existingEnrollment) {
      return res.status(400).json({ success: false, message: 'A student with this enrollment number already exists.' });
    }

    // Hash password & create User
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name: fullName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: 'student',
    });

    // Create Student document
    const newStudent = await Student.create({
      userId: newUser._id,
      enrollmentNo: normalizedEnrollment,
      fullName: fullName.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      department: department || 'Computer Engineering',
      semester: Number(semester) || 5,
      gender: gender || 'Male',
      guardianName: guardianName?.trim() || '',
      guardianPhone: guardianPhone?.trim() || '',
      address: address?.trim() || '',
      roomId: null,
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: 'Student account created successfully.',
      data: newStudent,
    });
  } catch (error: any) {
    console.error('createStudent error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create student account.', error: error.message });
  }
}

// PUT /api/students/:id - Update student (Admin)
export async function updateStudent(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const {
      fullName,
      phone,
      department,
      semester,
      gender,
      guardianName,
      guardianPhone,
      address,
      isActive,
    } = req.body;

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found.' });
    }

    if (fullName) {
      student.fullName = fullName.trim();
      await User.findByIdAndUpdate(student.userId, { name: fullName.trim() });
    }
    if (phone) student.phone = phone.trim();
    if (department) student.department = department;
    if (semester) student.semester = Number(semester);
    if (gender) student.gender = gender;
    if (guardianName !== undefined) student.guardianName = guardianName.trim();
    if (guardianPhone !== undefined) student.guardianPhone = guardianPhone.trim();
    if (address !== undefined) student.address = address.trim();
    if (isActive !== undefined) student.isActive = Boolean(isActive);

    await student.save();

    return res.json({
      success: true,
      message: 'Student record updated successfully.',
      data: student,
    });
  } catch (error: any) {
    console.error('updateStudent error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update student.', error: error.message });
  }
}

// DELETE /api/students/:id - Delete student and deallocate room bed
export async function deleteStudent(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    // If allocated to a room, decrement room occupancy
    if (student.roomId) {
      const room = await Room.findById(student.roomId);
      if (room) {
        room.occupied = Math.max(0, room.occupied - 1);
        room.status = room.occupied >= room.capacity ? 'Full' : 'Available';
        await room.save();
      }
    }

    // Delete student and corresponding user
    await Promise.all([
      Student.findByIdAndDelete(id),
      User.findByIdAndDelete(student.userId),
    ]);

    return res.json({
      success: true,
      message: 'Student account and credentials removed successfully.',
    });
  } catch (error: any) {
    console.error('deleteStudent error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete student.', error: error.message });
  }
}
