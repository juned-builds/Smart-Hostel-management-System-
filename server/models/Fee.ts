import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IFee extends Document {
  studentId: Types.ObjectId;
  academicYear: string;
  term: string;
  amount: number;
  paidAmount: number;
  dueDate: Date;
  status: 'Paid' | 'Pending' | 'Partial' | 'Overdue';
  paymentDate?: Date;
  paymentMode?: 'UPI' | 'Net Banking' | 'Cash' | 'Demand Draft' | 'Card';
  receiptNo?: string;
  remarks?: string;
  createdAt: Date;
}

const FeeSchema = new Schema<IFee>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    academicYear: { type: String, required: true, default: '2024-2025' },
    term: { type: String, required: true, default: 'Semester 5 (Odd Term)' },
    amount: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, default: 0, min: 0 },
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['Paid', 'Pending', 'Partial', 'Overdue'],
      default: 'Pending',
    },
    paymentDate: { type: Date },
    paymentMode: { type: String, enum: ['UPI', 'Net Banking', 'Cash', 'Demand Draft', 'Card'] },
    receiptNo: { type: String },
    remarks: { type: String, default: '' },
  },
  { timestamps: true }
);

FeeSchema.index({ studentId: 1 });
FeeSchema.index({ status: 1 });
FeeSchema.index({ academicYear: 1 });

export const Fee = mongoose.models.Fee || mongoose.model<IFee>('Fee', FeeSchema);
