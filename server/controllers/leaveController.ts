import { Response } from 'express';
import mongoose from 'mongoose';
import { LeaveRequest } from '../models/LeaveRequest.js';
import { Student } from '../models/Student.js';
import { AuthRequest } from '../middleware/auth.js';

// GET /api/leaves - View leave requests
export async function getLeaves(req: AuthRequest, res: Response) {
  try {
    const { status, leaveType } = req.query;
    const query: any = {};

    if (req.user?.role === 'student') {
      const student = await Student.findOne({ userId: req.user.userId });
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student profile not found.' });
      }
      query.studentId = student._id;
    } else {
      if (status && status !== 'All') query.status = status;
      if (leaveType && leaveType !== 'All') query.leaveType = leaveType;
    }

    const leaves = await LeaveRequest.find(query)
      .populate({
        path: 'studentId',
        select: 'fullName enrollmentNo phone department semester roomId',
        populate: { path: 'roomId', select: 'roomNumber block' },
      })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      data: leaves,
    });
  } catch (error: any) {
    console.error('getLeaves error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch leave requests.', error: error.message });
  }
}

// POST /api/leaves - Submit leave application (Student)
export async function createLeave(req: AuthRequest, res: Response) {
  try {
    const { leaveType, startDate, endDate, reason, destinationAddress, emergencyContact } = req.body;

    if (!startDate || !endDate || !reason) {
      return res.status(400).json({ success: false, message: 'Please provide start date, end date, and reason.' });
    }

    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({ success: false, message: 'End date cannot be earlier than start date.' });
    }

    let targetStudentId = req.user?.studentId;
    if (!targetStudentId) {
      const student = await Student.findOne({ userId: req.user?.userId });
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student profile required to submit leave request.' });
      }
      targetStudentId = student._id.toString();
    }

    const leave = await LeaveRequest.create({
      studentId: targetStudentId,
      leaveType: leaveType || 'Home Visit',
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason: reason.trim(),
      destinationAddress: destinationAddress?.trim() || '',
      emergencyContact: emergencyContact?.trim() || '',
      status: 'Pending',
    });

    const populated = await LeaveRequest.findById(leave._id).populate({
      path: 'studentId',
      select: 'fullName enrollmentNo phone roomId',
      populate: { path: 'roomId', select: 'roomNumber block' },
    });

    return res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully.',
      data: populated,
    });
  } catch (error: any) {
    console.error('createLeave error:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit leave request.', error: error.message });
  }
}

// PUT /api/leaves/:id - Approve / Reject leave (Admin)
export async function reviewLeave(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { status, adminRemarks } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid leave request ID.' });
    }

    if (!['Approved', 'Rejected', 'Pending'].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be 'Approved', 'Rejected', or 'Pending'." });
    }

    const leave = await LeaveRequest.findById(id);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found.' });
    }

    leave.status = status;
    if (adminRemarks !== undefined) leave.adminRemarks = adminRemarks.trim();
    leave.reviewedBy = new mongoose.Types.ObjectId(req.user?.userId);
    leave.reviewedAt = new Date();

    await leave.save();

    const populated = await LeaveRequest.findById(id).populate({
      path: 'studentId',
      select: 'fullName enrollmentNo phone roomId',
      populate: { path: 'roomId', select: 'roomNumber block' },
    });

    return res.json({
      success: true,
      message: `Leave request ${status.toLowerCase()} successfully.`,
      data: populated,
    });
  } catch (error: any) {
    console.error('reviewLeave error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update leave request.', error: error.message });
  }
}
