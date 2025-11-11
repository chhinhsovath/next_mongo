import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAttendance extends Document {
  attendance_id: string;
  employee_id: mongoose.Types.ObjectId;
  work_date: string; // YYYY-MM-DD in Cambodia timezone
  check_in_time?: Date; // UTC timestamp
  check_out_time?: Date; // UTC timestamp
  check_in_location_lat?: number;
  check_in_location_lng?: number;
  check_out_location_lat?: number;
  check_out_location_lng?: number;
  work_hours?: number;
  attendance_status: 'present' | 'late' | 'absent' | 'half_day';
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    attendance_id: {
      type: String,
      unique: true,
    },
    employee_id: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    work_date: {
      type: String,
      required: true,
    },
    check_in_time: {
      type: Date,
    },
    check_out_time: {
      type: Date,
    },
    check_in_location_lat: {
      type: Number,
    },
    check_in_location_lng: {
      type: Number,
    },
    check_out_location_lat: {
      type: Number,
    },
    check_out_location_lng: {
      type: Number,
    },
    work_hours: {
      type: Number,
    },
    attendance_status: {
      type: String,
      enum: ['present', 'late', 'absent', 'half_day'],
      required: true,
      default: 'absent',
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Create compound index for employee and work_date
AttendanceSchema.index({ employee_id: 1, work_date: 1 }, { unique: true });
AttendanceSchema.index({ work_date: 1 });
AttendanceSchema.index({ attendance_status: 1 });

// Generate attendance_id before saving
AttendanceSchema.pre('save', async function (next) {
  if (!this.attendance_id) {
    const count = await mongoose.model('Attendance').countDocuments();
    this.attendance_id = `ATT${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

const Attendance: Model<IAttendance> =
  mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema);

export default Attendance;
