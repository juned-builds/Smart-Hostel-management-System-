import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Student } from '../models/Student.js';
import { AuthRequest, getJwtSecret } from '../middleware/auth.js';

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email address or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email address or password.' });
    }

    let studentProfile = null;
    if (user.role === 'student') {
      studentProfile = await Student.findOne({ userId: user._id });
    }

    const payload = {
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
      studentId: studentProfile?._id?.toString(),
    };

    const jwtSecret = getJwtSecret();
    const token = jwt.sign(payload, jwtSecret, { expiresIn: '7d' });

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: studentProfile?._id || null,
        enrollmentNo: studentProfile?.enrollmentNo || null,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error during authentication.', error: error.message });
  }
}

export async function getMe(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }

    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User record not found.' });
    }

    let student = null;
    if (user.role === 'student') {
      student = await Student.findOne({ userId: user._id }).populate('roomId');
    }

    return res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        student,
      },
    });
  } catch (error: any) {
    console.error('getMe error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve profile.', error: error.message });
  }
}

export async function changePassword(req: AuthRequest, res: Response) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide both current and new password.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
    }

    const user = await User.findById(req.user?.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect current password.' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({ success: true, message: 'Password updated successfully.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Error updating password.', error: error.message });
  }
}
