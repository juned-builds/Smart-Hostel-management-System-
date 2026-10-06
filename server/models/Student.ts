import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IStudent extends Document {
  userId: Types.ObjectId;
  enrollmentNo: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  semester: number;
  gender: 'Male' | 'Female' | 'Other';
  guardianName: string;
  guardianPhone: string;
  address: string;
  roomId: Types.ObjectId | null;
  bedNo?: string;
  isActive: boolean;
  createdAt: Date;
}

const StudentSchema = new Schema<IStudent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    enrollmentNo: { type: String, required: true, unique: true, uppercase: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    department: { type: String, required: true, default: 'Computer Engineering' },
    semester: { type: Number, required: true, min: 1, max: 8, default: 5 },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },
    guardianName: { type: String, default: '' },
    guardianPhone: { type: String, default: '' },
    address: { type: String, default: '' },
    roomId: { type: Schema.Types.ObjectId, ref: 'Room', default: null },
    bedNo: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

StudentSchema.index({ enrollmentNo: 1 });
StudentSchema.index({ roomId: 1 });
StudentSchema.index({ department: 1 });

export const Student = mongoose.models.Student || mongoose.model<IStudent>('Student', StudentSchema);
