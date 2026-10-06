import { Response } from 'express';
import mongoose from 'mongoose';
import { Complaint } from '../models/Complaint.js';
import { Student } from '../models/Student.js';
import { AuthRequest } from '../middleware/auth.js';

// GET /api/complaints - View complaints (Admin sees all; Student sees own)
export async function getComplaints(req: AuthRequest, res: Response) {
  try {
    const { status, category, priority } = req.query;
    const query: any = {};

    if (req.user?.role === 'student') {
      const student = await Student.findOne({ userId: req.user.userId });
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student profile not found.' });
      }
      query.studentId = student._id;
    } else {
      // Admin filters
      if (status && status !== 'All') query.status = status;
      if (category && category !== 'All') query.category = category;
      if (priority && priority !== 'All') query.priority = priority;
    }

    const complaints = await Complaint.find(query)
      .populate({
        path: 'studentId',
        select: 'fullName enrollmentNo phone department semester roomId',
        populate: { path: 'roomId', select: 'roomNumber block' },
      })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      data: complaints,
    });
  } catch (error: any) {
    console.error('getComplaints error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch complaints.', error: error.message });
  }
}

// POST /api/complaints - Submit complaint (Student)
export async function createComplaint(req: AuthRequest, res: Response) {
  try {
    const { title, description, category, priority } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Please provide title and description.' });
    }

    let targetStudentId = req.user?.studentId;
    if (!targetStudentId) {
      const student = await Student.findOne({ userId: req.user?.userId });
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student profile required to log complaint.' });
      }
      targetStudentId = student._id.toString();
    }

    const complaint = await Complaint.create({
      studentId: targetStudentId,
      title: title.trim(),
      description: description.trim(),
      category: category || 'Other',
      priority: priority || 'Medium',
      status: 'Pending',
    });

    const populated = await Complaint.findById(complaint._id).populate({
      path: 'studentId',
      select: 'fullName enrollmentNo phone roomId',
      populate: { path: 'roomId', select: 'roomNumber block' },
    });

    return res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully.',
      data: populated,
    });
  } catch (error: any) {
    console.error('createComplaint error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create complaint.', error: error.message });
  }
}

// PUT /api/complaints/:id - Update status and remarks (Admin)
export async function updateComplaintStatus(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { status, resolutionRemarks } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid complaint ID.' });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    if (status) complaint.status = status;
    if (resolutionRemarks !== undefined) complaint.resolutionRemarks = resolutionRemarks.trim();
    if (status === 'Resolved') {
      complaint.resolvedAt = new Date();
    }

    await complaint.save();

    const populated = await Complaint.findById(id).populate({
      path: 'studentId',
      select: 'fullName enrollmentNo phone roomId',
      populate: { path: 'roomId', select: 'roomNumber block' },
    });

    return res.json({
      success: true,
      message: 'Complaint status updated.',
      data: populated,
    });
  } catch (error: any) {
    console.error('updateComplaintStatus error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update complaint.', error: error.message });
  }
}
