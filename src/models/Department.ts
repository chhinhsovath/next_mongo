import mongoose, { Schema, Model } from 'mongoose';
import { DepartmentStatus } from '@/types';

export interface IDepartment {
  _id: mongoose.Types.ObjectId;
  department_id: string;
  department_code: string;
  department_name: string;
  department_name_khmer?: string;
  manager_id?: string;
  parent_department_id?: string;
  department_status: DepartmentStatus;
  created_at: Date;
  updated_at: Date;
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    department_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    department_code: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    department_name: {
      type: String,
      required: true,
    },
    department_name_khmer: {
      type: String,
    },
    manager_id: {
      type: String,
      index: true,
    },
    parent_department_id: {
      type: String,
      index: true,
    },
    department_status: {
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
const Department: Model<IDepartment> =
  mongoose.models.Department || mongoose.model<IDepartment>('Department', DepartmentSchema);

export default Department;
