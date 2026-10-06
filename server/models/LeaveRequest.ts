import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ILeaveRequest extends Document {
  studentId: Types.ObjectId;
  leaveType: 'Home Visit' | 'Medical' | 'Academic/Event' | 'Emergency' | 'Other';
  startDate: Date;
  endDate: Date;
  reason: string;
  destinationAddress: string;
  emergencyContact: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  adminRemarks: string;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
}

const LeaveRequestSchema = new Schema<ILeaveRequest>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    leaveType: {
      type: String,
      enum: ['Home Visit', 'Medical', 'Academic/Event', 'Emergency', 'Other'],
      default: 'Home Visit',
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true, trim: true },
    destinationAddress: { type: String, default: '' },
    emergencyContact: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    adminRemarks: { type: String, default: '' },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

LeaveRequestSchema.index({ studentId: 1 });
LeaveRequestSchema.index({ status: 1 });

export const LeaveRequest =
  mongoose.models.LeaveRequest || mongoose.model<ILeaveRequest>('LeaveRequest', LeaveRequestSchema);
