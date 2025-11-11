import mongoose, { Schema, Model } from 'mongoose';
import { LeaveTypeStatus } from '@/types';

export interface ILeaveType {
  _id: mongoose.Types.ObjectId;
  leave_type_id: string;
  leave_type_name: string;
  leave_type_name_khmer?: string;
  annual_quota: number;
  is_paid: boolean;
  leave_type_status: LeaveTypeStatus;
  created_at: Date;
  updated_at: Date;
}

const LeaveTypeSchema = new Schema<ILeaveType>(
  {
    leave_type_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    leave_type_name: {
      type: String,
      required: true,
    },
    leave_type_name_khmer: {
      type: String,
    },
    annual_quota: {
      type: Number,
      required: true,
    },
    is_paid: {
      type: Boolean,
      required: true,
      default: true,
    },
    leave_type_status: {
      type: String,
      enum: ['active', 'inactive'],
      required: true,
      default: 'active',
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

// Prevent model recompilation in development
const LeaveType: Model<ILeaveType> =
  mongoose.models.LeaveType || mongoose.model<ILeaveType>('LeaveType', LeaveTypeSchema);

export default LeaveType;
