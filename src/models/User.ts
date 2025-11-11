import mongoose, { Schema, Model } from 'mongoose';
import { UserRole, UserStatus } from '@/types';

export interface IUser {
  _id: mongoose.Types.ObjectId;
  user_id: string;
  employee_id: string;
  username: string;
  password_hash: string;
  user_role: UserRole;
  last_login_at?: Date;
  user_status: UserStatus;
  created_at: Date;
  updated_at: Date;
}

const UserSchema = new Schema<IUser>(
  {
    user_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    employee_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    password_hash: {
      type: String,
      required: true,
    },
    user_role: {
      type: String,
      enum: ['admin', 'hr_manager', 'manager', 'employee'],
      required: true,
      default: 'employee',
    },
    last_login_at: {
      type: Date,
    },
    user_status: {
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
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
