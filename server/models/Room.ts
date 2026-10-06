import mongoose, { Schema, Document } from 'mongoose';

export interface IRoom extends Document {
  roomNumber: string;
  block: string;
  floor: number;
  capacity: number;
  occupied: number;
  type: 'Standard' | 'Deluxe' | 'AC' | 'Non-AC';
  status: 'Available' | 'Full' | 'Maintenance';
  monthlyRent: number;
  createdAt: Date;
}

const RoomSchema = new Schema<IRoom>(
  {
    roomNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    block: { type: String, required: true, trim: true },
    floor: { type: Number, required: true, min: 0 },
    capacity: { type: Number, required: true, min: 1, default: 2 },
    occupied: { type: Number, required: true, default: 0, min: 0 },
    type: { type: String, enum: ['Standard', 'Deluxe', 'AC', 'Non-AC'], default: 'Standard' },
    status: { type: String, enum: ['Available', 'Full', 'Maintenance'], default: 'Available' },
    monthlyRent: { type: Number, default: 4500 },
  },
  { timestamps: true }
);

RoomSchema.index({ roomNumber: 1 });
RoomSchema.index({ status: 1 });
RoomSchema.index({ block: 1 });

export const Room = mongoose.models.Room || mongoose.model<IRoom>('Room', RoomSchema);
