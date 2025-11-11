import mongoose, { Schema, Model } from 'mongoose';
import { LeaveStatus } from '@/types';

export interface ILeaveRequest {
  _id: mongoose.Types.ObjectId;
  leave_request_id: string;
  employee_id: string;
  leave_type_id: string;
  start_date: Date;
  end_date: Date;
  total_days: number;
  reason: string;
  leave_status: LeaveStatus;
  approved_by?: string;
  approved_at?: Date;
  rejection_reason?: string;
  created_at: Date;
  updated_at: Date;
}

const LeaveRequestSchema = new Schema<ILeaveRequest>(
  {
    leave_request_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    employee_id: {
      type: String,
      required: true,
      index: true,
    },
    leave_type_id: {
      type: String,
      required: true,
      index: true,
    },
    start_date: {
      type: Date,
      required: true,
    },
    end_date: {
      type: Date,
      required: true,
    },
    total_days: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    leave_status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      required: true,
      default: 'pending',
    },
    approved_by: {
      type: String,
    },
    approved_at: {
      type: Date,
    },
    rejection_reason: {
      type: String,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

// Compound indexes for performance
LeaveRequestSchema.index({ employee_id: 1, leave_status: 1 });
LeaveRequestSchema.index({ employee_id: 1, start_date: 1, end_date: 1 });
LeaveRequestSchema.index({ leave_status: 1, created_at: -1 });
LeaveRequestSchema.index({ start_date: 1, end_date: 1 });

// Prevent model recompilation in development
const LeaveRequest: Model<ILeaveRequest> =
  mongoose.models.LeaveRequest || mongoose.model<ILeaveRequest>('LeaveRequest', LeaveRequestSchema);

export default LeaveRequest;
