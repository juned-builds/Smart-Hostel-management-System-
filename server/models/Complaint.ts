import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IComplaint extends Document {
  studentId: Types.ObjectId;
  title: string;
  description: string;
  category: 'Electrical' | 'Plumbing' | 'Carpentry' | 'Cleaning' | 'Wi-Fi/Internet' | 'Mess/Food' | 'Other';
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'In Progress' | 'Resolved' | 'Rejected';
  resolutionRemarks: string;
  resolvedAt?: Date;
  createdAt: Date;
}

const ComplaintSchema = new Schema<IComplaint>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['Electrical', 'Plumbing', 'Carpentry', 'Cleaning', 'Wi-Fi/Internet', 'Mess/Food', 'Other'],
      default: 'Other',
    },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'],
      default: 'Pending',
    },
    resolutionRemarks: { type: String, default: '' },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

ComplaintSchema.index({ studentId: 1 });
ComplaintSchema.index({ status: 1 });
ComplaintSchema.index({ category: 1 });

export const Complaint = mongoose.models.Complaint || mongoose.model<IComplaint>('Complaint', ComplaintSchema);
