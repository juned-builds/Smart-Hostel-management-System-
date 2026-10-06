import { Response } from 'express';
import mongoose from 'mongoose';
import { Fee } from '../models/Fee.js';
import { Student } from '../models/Student.js';
import { AuthRequest } from '../middleware/auth.js';

// GET /api/fees - List fee records
export async function getFees(req: AuthRequest, res: Response) {
  try {
    const { status, academicYear } = req.query;
    const query: any = {};

    if (req.user?.role === 'student') {
      const student = await Student.findOne({ userId: req.user.userId });
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student record not found.' });
      }
      query.studentId = student._id;
    } else {
      if (status && status !== 'All') query.status = status;
      if (academicYear && academicYear !== 'All') query.academicYear = academicYear;
    }

    const fees = await Fee.find(query)
      .populate({
        path: 'studentId',
        select: 'fullName enrollmentNo phone department semester roomId',
        populate: { path: 'roomId', select: 'roomNumber block' },
      })
      .sort({ dueDate: -1 })
      .lean();

    return res.json({
      success: true,
      data: fees,
    });
  } catch (error: any) {
    console.error('getFees error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch fee records.', error: error.message });
  }
}

// POST /api/fees - Create fee record (Admin)
export async function createFee(req: AuthRequest, res: Response) {
  try {
    const { studentId, academicYear, term, amount, dueDate, status, remarks } = req.body;

    if (!studentId || !amount || !dueDate) {
      return res.status(400).json({ success: false, message: 'Please provide studentId, amount, and dueDate.' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const newFee = await Fee.create({
      studentId,
      academicYear: academicYear || '2024-2025',
      term: term || 'Semester 5 (Odd Term)',
      amount: Number(amount),
      paidAmount: status === 'Paid' ? Number(amount) : 0,
      dueDate: new Date(dueDate),
      status: status || 'Pending',
      remarks: remarks?.trim() || '',
      receiptNo: status === 'Paid' ? `GTU-REC-${Date.now().toString().slice(-6)}` : undefined,
      paymentDate: status === 'Paid' ? new Date() : undefined,
    });

    const populated = await Fee.findById(newFee._id).populate({
      path: 'studentId',
      select: 'fullName enrollmentNo phone department semester',
    });

    return res.status(201).json({
      success: true,
      message: 'Fee invoice created successfully.',
      data: populated,
    });
  } catch (error: any) {
    console.error('createFee error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create fee record.', error: error.message });
  }
}

// PUT /api/fees/:id - Update fee record / Mark Paid (Admin)
export async function updateFee(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { status, paidAmount, paymentMode, remarks, dueDate } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid fee record ID.' });
    }

    const fee = await Fee.findById(id);
    if (!fee) {
      return res.status(404).json({ success: false, message: 'Fee record not found.' });
    }

    if (status) fee.status = status;
    if (paidAmount !== undefined) fee.paidAmount = Number(paidAmount);
    if (paymentMode) fee.paymentMode = paymentMode;
    if (remarks !== undefined) fee.remarks = remarks.trim();
    if (dueDate) fee.dueDate = new Date(dueDate);

    if (status === 'Paid') {
      fee.paidAmount = fee.amount;
      if (!fee.receiptNo) {
        fee.receiptNo = `GTU-REC-${Date.now().toString().slice(-6)}`;
      }
      fee.paymentDate = new Date();
    }

    await fee.save();

    const populated = await Fee.findById(id).populate({
      path: 'studentId',
      select: 'fullName enrollmentNo phone department semester',
    });

    return res.json({
      success: true,
      message: 'Fee record updated.',
      data: populated,
    });
  } catch (error: any) {
    console.error('updateFee error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update fee record.', error: error.message });
  }
}

// POST /api/fees/:id/pay - Student simulated payment
export async function payFee(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { paymentMode = 'UPI' } = req.body;

    const fee = await Fee.findById(id);
    if (!fee) {
      return res.status(404).json({ success: false, message: 'Fee record not found.' });
    }

    fee.status = 'Paid';
    fee.paidAmount = fee.amount;
    fee.paymentMode = paymentMode;
    fee.paymentDate = new Date();
    fee.receiptNo = `GTU-PAY-${Date.now().toString().slice(-7)}`;
    await fee.save();

    return res.json({
      success: true,
      message: 'Payment received successfully. Receipt generated.',
      data: fee,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Payment processing error.', error: error.message });
  }
}
