import mongoose, { Schema, Model } from 'mongoose';
import { PositionStatus } from '@/types';

export interface IPosition {
  _id: mongoose.Types.ObjectId;
  position_id: string;
  position_code: string;
  position_name: string;
  position_name_khmer?: string;
  department_id: string;
  position_level?: number;
  position_status: PositionStatus;
  created_at: Date;
  updated_at: Date;
}

const PositionSchema = new Schema<IPosition>(
  {
    position_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    position_code: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    position_name: {
      type: String,
      required: true,
    },
    position_name_khmer: {
      type: String,
    },
    department_id: {
      type: String,
      required: true,
      index: true,
    },
    position_level: {
      type: Number,
    },
    position_status: {
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

// Compound index for department-position queries
PositionSchema.index({ department_id: 1, position_status: 1 });

// Prevent model recompilation in development
const Position: Model<IPosition> =
  mongoose.models.Position || mongoose.model<IPosition>('Position', PositionSchema);

export default Position;
