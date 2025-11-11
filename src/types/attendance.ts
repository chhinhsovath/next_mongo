import { AttendanceStatus } from './index';

export interface Attendance {
  _id: string;
  attendance_id: string;
  employee_id: string;
  work_date: string; // YYYY-MM-DD
  check_in_time?: Date;
  check_out_time?: Date;
  check_in_location_lat?: number;
  check_in_location_lng?: number;
  check_out_location_lat?: number;
  check_out_location_lng?: number;
  work_hours?: number;
  attendance_status: AttendanceStatus;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CheckInInput {
  employee_id: string;
  work_date: string;
  check_in_time: Date;
  check_in_location_lat?: number;
  check_in_location_lng?: number;
}

export interface CheckOutInput {
  employee_id: string;
  work_date: string;
  check_out_time: Date;
  check_out_location_lat?: number;
  check_out_location_lng?: number;
}
