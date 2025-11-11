import mongoose, { Schema, Model } from 'mongoose';

export interface ILeaveBalance {
  _id: mongoose.Types.ObjectId;
  leave_balance_id: string;
  employee_id: string;
  leave_type_id: string;
  year: number;
  total_allocated: number;
  used_days: number;
  remaining_days: number;
  created_at: Date;
  updated_at: Date;
}

const LeaveBalanceSchema = new Schema<ILeaveBalance>(
  {
    leave_balance_id: {
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
    year: {
      type: Number,
      required: true,
    },
    total_allocated: {
      type: Number,
      required: true,
    },
    used_days: {
      type: Number,
      required: true,
      default: 0,
    },
    remaining_days: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

// Compound unique index to ensure one balance per employee per leave type per year
LeaveBalanceSchema.index({ employee_id: 1, leave_type_id: 1, year: 1 }, { unique: true });

// Prevent model recompilation in development
const LeaveBalance: Model<ILeaveBalance> =
  mongoose.models.LeaveBalance || mongoose.model<ILeaveBalance>('LeaveBalance', LeaveBalanceSchema);

export default LeaveBalance;
