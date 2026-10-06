import { Request, Response } from 'express';
import { Student } from '../models/Student.js';
import { Room } from '../models/Room.js';
import { Complaint } from '../models/Complaint.js';
import { LeaveRequest } from '../models/LeaveRequest.js';
import { Fee } from '../models/Fee.js';
import { Notice } from '../models/Notice.js';

// GET /api/dashboard/stats - Advanced aggregation stats for Admin Dashboard
export async function getDashboardStats(req: Request, res: Response) {
  try {
    // 1. Room Occupancy Aggregation Pipeline
    const [roomStatsResult] = await Room.aggregate([
      {
        $group: {
          _id: null,
          totalRooms: { $sum: 1 },
          totalCapacity: { $sum: '$capacity' },
          totalOccupied: { $sum: '$occupied' },
        },
      },
      {
        $project: {
          _id: 0,
          totalRooms: 1,
          totalCapacity: 1,
          totalOccupied: 1,
          availableBeds: { $subtract: ['$totalCapacity', '$totalOccupied'] },
          occupancyRate: {
            $cond: [
              { $gt: ['$totalCapacity', 0] },
              { $round: [{ $multiply: [{ $divide: ['$totalOccupied', '$totalCapacity'] }, 100] }, 1] },
              0,
            ],
          },
        },
      },
    ]);

    const roomStats = roomStatsResult || {
      totalRooms: 0,
      totalCapacity: 0,
      totalOccupied: 0,
      availableBeds: 0,
      occupancyRate: 0,
    };

    // 2. Student Counts
    const [totalStudents, activeStudents, unallocatedStudents] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({ isActive: true }),
      Student.countDocuments({ isActive: true, roomId: null }),
    ]);

    // 3. Complaints Grouped by Status Aggregation
    const complaintsByStatusRaw = await Complaint.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const complaintsByStatus = {
      Pending: 0,
      'In Progress': 0,
      Resolved: 0,
      Rejected: 0,
    };
    let totalComplaints = 0;
    complaintsByStatusRaw.forEach((item) => {
      if (item._id in complaintsByStatus) {
        (complaintsByStatus as any)[item._id] = item.count;
      }
      totalComplaints += item.count;
    });

    // 4. Complaints Grouped by Category Aggregation
    const complaintsByCategory = await Complaint.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // 5. Leave Requests Grouped by Status Aggregation
    const leavesByStatusRaw = await LeaveRequest.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const leavesByStatus = {
      Pending: 0,
      Approved: 0,
      Rejected: 0,
    };
    let totalLeaves = 0;
    leavesByStatusRaw.forEach((item) => {
      if (item._id in leavesByStatus) {
        (leavesByStatus as any)[item._id] = item.count;
      }
      totalLeaves += item.count;
    });

    // 6. Fee Statistics Aggregation
    const feeStatsRaw = await Fee.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          totalPaid: { $sum: '$paidAmount' },
        },
      },
    ]);

    let totalFeesExpected = 0;
    let totalFeesCollected = 0;
    let pendingFeeRecords = 0;
    let paidFeeRecords = 0;

    feeStatsRaw.forEach((item) => {
      totalFeesExpected += item.totalAmount;
      totalFeesCollected += item.totalPaid;
      if (item._id === 'Pending' || item._id === 'Overdue') {
        pendingFeeRecords += item.count;
      } else if (item._id === 'Paid') {
        paidFeeRecords += item.count;
      }
    });

    // 7. Room Distribution by Block Aggregation
    const roomsByBlock = await Room.aggregate([
      {
        $group: {
          _id: '$block',
          rooms: { $sum: 1 },
          capacity: { $sum: '$capacity' },
          occupied: { $sum: '$occupied' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 8. Recent Items for Activity Overview
    const [recentComplaints, recentLeaves, recentNotices] = await Promise.all([
      Complaint.find()
        .populate('studentId', 'fullName enrollmentNo')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      LeaveRequest.find()
        .populate('studentId', 'fullName enrollmentNo')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Notice.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(4)
        .lean(),
    ]);

    return res.json({
      success: true,
      data: {
        students: {
          total: totalStudents,
          active: activeStudents,
          allocated: activeStudents - unallocatedStudents,
          unallocated: unallocatedStudents,
        },
        rooms: roomStats,
        roomsByBlock,
        complaints: {
          total: totalComplaints,
          byStatus: complaintsByStatus,
          byCategory: complaintsByCategory,
        },
        leaves: {
          total: totalLeaves,
          byStatus: leavesByStatus,
        },
        fees: {
          totalExpected: totalFeesExpected,
          totalCollected: totalFeesCollected,
          pendingAmount: Math.max(0, totalFeesExpected - totalFeesCollected),
          pendingRecords: pendingFeeRecords,
          paidRecords: paidFeeRecords,
          byStatus: feeStatsRaw,
        },
        recent: {
          complaints: recentComplaints,
          leaves: recentLeaves,
          notices: recentNotices,
        },
      },
    });
  } catch (error: any) {
    console.error('getDashboardStats error:', error);
    return res.status(500).json({ success: false, message: 'Failed to compute dashboard metrics.', error: error.message });
  }
}
