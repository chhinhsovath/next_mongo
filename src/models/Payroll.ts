import mongoose, { Schema, Document } from 'mongoose';

export interface IPayroll extends Document {
  payroll_id: string;
  employee_id: mongoose.Types.ObjectId;
  payroll_month: string; // Format: "YYYY-MM"
  base_salary: number;
  allowances: number;
  bonuses: number;
  deductions: number;
  overtime_pay: number;
  net_salary: number; // Calculated: base_salary + allowances + bonuses + overtime_pay - deductions
  payment_date?: Date;
  payroll_status: 'draft' | 'approved' | 'paid';
  created_at: Date;
  updated_at: Date;
}

const PayrollSchema = new Schema<IPayroll>(
  {
    payroll_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    employee_id: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
      index: true,
    },
    payroll_month: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}$/, // YYYY-MM format
      index: true,
    },
    base_salary: {
      type: Number,
      required: true,
      min: 0,
    },
    allowances: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    bonuses: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    deductions: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    overtime_pay: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    net_salary: {
      type: Number,
      required: true,
      min: 0,
    },
    payment_date: {
      type: Date,
    },
    payroll_status: {
      type: String,
      enum: ['draft', 'approved', 'paid'],
      default: 'draft',
      required: true,
      index: true,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

// Compound index for unique payroll per employee per month
PayrollSchema.index({ employee_id: 1, payroll_month: 1 }, { unique: true });
PayrollSchema.index({ payroll_month: 1, payroll_status: 1 });
PayrollSchema.index({ payroll_status: 1, created_at: -1 });

// Pre-save hook to calculate net_salary
PayrollSchema.pre('save', function (next) {
  this.net_salary = this.base_salary + this.allowances + this.bonuses + this.overtime_pay - this.deductions;
  next();
});

const Payroll = mongoose.models.Payroll || mongoose.model<IPayroll>('Payroll', PayrollSchema);

export default Payroll;
