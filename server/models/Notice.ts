import mongoose, { Schema, Document } from 'mongoose';

export interface INotice extends Document {
  title: string;
  content: string;
  category: 'General' | 'Rules & Regulations' | 'Fee Deadline' | 'Mess Notice' | 'Urgent';
  priority: 'Normal' | 'Important' | 'High Priority';
  postedBy: string;
  isActive: boolean;
  createdAt: Date;
}

const NoticeSchema = new Schema<INotice>(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['General', 'Rules & Regulations', 'Fee Deadline', 'Mess Notice', 'Urgent'],
      default: 'General',
    },
    priority: {
      type: String,
      enum: ['Normal', 'Important', 'High Priority'],
      default: 'Normal',
    },
    postedBy: { type: String, default: 'Hostel Rector / Warden' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

NoticeSchema.index({ createdAt: -1 });
NoticeSchema.index({ priority: 1 });

export const Notice = mongoose.models.Notice || mongoose.model<INotice>('Notice', NoticeSchema);
