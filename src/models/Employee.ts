import mongoose, { Schema, Model } from 'mongoose';
import { EmployeeType, EmployeeStatus, Gender } from '@/types';

export interface IEmployee {
  _id: mongoose.Types.ObjectId;
  employee_id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  first_name_khmer?: string;
  last_name_khmer?: string;
  email: string;
  phone_number: string;
  date_of_birth: Date;
  gender: Gender;
  national_id: string;
  address: string;
  department_id: string;
  position_id: string;
  employee_type: EmployeeType;
  employee_status: EmployeeStatus;
  hire_date: Date;
  termination_date?: Date;
  salary_amount: number;
  profile_photo_url?: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

const EmployeeSchema = new Schema<IEmployee>(
  {
    employee_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    employee_code: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      required: true,
    },
    first_name_khmer: {
      type: String,
    },
    last_name_khmer: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    phone_number: {
      type: String,
      required: true,
    },
    date_of_birth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: true,
    },
    national_id: {
      type: String,
      required: true,
      unique: true,
    },
    address: {
      type: String,
      required: true,
    },
    department_id: {
      type: String,
      required: true,
      index: true,
    },
    position_id: {
      type: String,
      required: true,
      index: true,
    },
    employee_type: {
      type: String,
      enum: ['full_time', 'part_time', 'contract', 'intern'],
      required: true,
    },
    employee_status: {
      type: String,
      enum: ['active', 'inactive', 'terminated'],
      required: true,
      default: 'active',
    },
    hire_date: {
      type: Date,
      required: true,
    },
    termination_date: {
      type: Date,
    },
    salary_amount: {
      type: Number,
      required: true,
    },
    profile_photo_url: {
      type: String,
    },
    deleted_at: {
      type: Date,
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

// Compound indexes for performance optimization
EmployeeSchema.index({ department_id: 1, employee_status: 1 });
EmployeeSchema.index({ position_id: 1, employee_status: 1 });
EmployeeSchema.index({ deleted_at: 1, employee_status: 1 });

// Prevent model recompilation in development
const Employee: Model<IEmployee> =
  mongoose.models.Employee || mongoose.model<IEmployee>('Employee', EmployeeSchema);

export default Employee;
