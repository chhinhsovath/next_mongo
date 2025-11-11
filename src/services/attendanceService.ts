import Attendance, { IAttendance } from '@/models/Attendance';
import Employee from '@/models/Employee';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { connectDB } from '@/lib/mongodb';

dayjs.extend(utc);
dayjs.extend(timezone);

const CAMBODIA_TZ = 'Asia/Phnom_Penh';
const WORK_START_HOUR = 8; // 8:00 AM
const LATE_THRESHOLD_MINUTES = 15; // Late if check-in after 8:15 AM
const HALF_DAY_HOURS = 4; // Less than 4 hours is half day

interface CheckInData {
  employee_id: string;
  check_in_time: Date;
  check_in_location_lat?: number;
  check_in_location_lng?: number;
}

interface CheckOutData {
  employee_id: string;
  work_date: string;
  check_out_time: Date;
  check_out_location_lat?: number;
  check_out_location_lng?: number;
}

interface AttendanceQuery {
  employee_id?: string;
  start_date?: string;
  end_date?: string;
  attendance_status?: string;
}

/**
 * Get work date in Cambodia timezone from a UTC timestamp
 */
export function getWorkDate(utcDate: Date): string {
  return dayjs(utcDate).tz(CAMBODIA_TZ).format('YYYY-MM-DD');
}

/**
 * Calculate work hours between check-in and check-out times
 */
export function calculateWorkHours(checkIn: Date, checkOut: Date): number {
  const diffMs = checkOut.getTime() - checkIn.getTime();
  const hours = diffMs / (1000 * 60 * 60);
  return Math.round(hours * 100) / 100; // Round to 2 decimal places
}

/**
 * Determine attendance status based on check-in time and work hours
 */
export function determineAttendanceStatus(
  checkInTime: Date,
  workHours?: number
): 'present' | 'late' | 'half_day' {
  const checkInCambodia = dayjs(checkInTime).tz(CAMBODIA_TZ);
  const checkInHour = checkInCambodia.hour();
  const checkInMinute = checkInCambodia.minute();
  
  // Calculate minutes after work start time
  const minutesAfterStart = (checkInHour - WORK_START_HOUR) * 60 + checkInMinute;
  
  // Check if half day based on work hours
  if (workHours !== undefined && workHours < HALF_DAY_HOURS) {
    return 'half_day';
  }
  
  // Check if late
  if (minutesAfterStart > LATE_THRESHOLD_MINUTES) {
    return 'late';
  }
  
  return 'present';
}

/**
 * Check in attendance
 */
export async function checkIn(data: CheckInData): Promise<IAttendance> {
  await connectDB();
  
  // Verify employee exists
  const employee = await Employee.findById(data.employee_id);
  if (!employee) {
    throw new Error('Employee not found');
  }
  
  // Get work date in Cambodia timezone
  const workDate = getWorkDate(data.check_in_time);
  
  // Check if attendance already exists for this date
  const existing = await Attendance.findOne({
    employee_id: data.employee_id,
    work_date: workDate,
  });
  
  if (existing) {
    throw new Error('Attendance already recorded for this date');
  }
  
  // Determine initial status (will be updated on check-out)
  const status = determineAttendanceStatus(data.check_in_time);
  
  // Create attendance record
  const attendance = await Attendance.create({
    employee_id: data.employee_id,
    work_date: workDate,
    check_in_time: data.check_in_time,
    check_in_location_lat: data.check_in_location_lat,
    check_in_location_lng: data.check_in_location_lng,
    attendance_status: status,
  });
  
  return attendance;
}

/**
 * Check out attendance
 */
export async function checkOut(data: CheckOutData): Promise<IAttendance> {
  await connectDB();
  
  // Find attendance record
  const attendance = await Attendance.findOne({
    employee_id: data.employee_id,
    work_date: data.work_date,
  });
  
  if (!attendance) {
    throw new Error('No check-in record found for this date');
  }
  
  if (attendance.check_out_time) {
    throw new Error('Already checked out for this date');
  }
  
  if (!attendance.check_in_time) {
    throw new Error('Cannot check out without check-in');
  }
  
  // Calculate work hours
  const workHours = calculateWorkHours(attendance.check_in_time, data.check_out_time);
  
  // Update status based on work hours
  const status = determineAttendanceStatus(attendance.check_in_time, workHours);
  
  // Update attendance record
  attendance.check_out_time = data.check_out_time;
  attendance.check_out_location_lat = data.check_out_location_lat;
  attendance.check_out_location_lng = data.check_out_location_lng;
  attendance.work_hours = workHours;
  attendance.attendance_status = status;
  
  await attendance.save();
  
  return attendance;
}

/**
 * Get attendance records with filters
 */
export async function getAttendanceRecords(query: AttendanceQuery) {
  await connectDB();
  
  const filter: any = {};
  
  if (query.employee_id) {
    filter.employee_id = query.employee_id;
  }
  
  if (query.start_date || query.end_date) {
    filter.work_date = {};
    if (query.start_date) {
      filter.work_date.$gte = query.start_date;
    }
    if (query.end_date) {
      filter.work_date.$lte = query.end_date;
    }
  }
  
  if (query.attendance_status) {
    filter.attendance_status = query.attendance_status;
  }
  
  const records = await Attendance.find(filter)
    .populate('employee_id', 'first_name last_name employee_code')
    .sort({ work_date: -1 })
    .lean();
  
  return records;
}

/**
 * Get attendance record by employee and date
 */
export async function getAttendanceByDate(
  employeeId: string,
  workDate: string
): Promise<IAttendance | null> {
  await connectDB();
  
  const attendance = await Attendance.findOne({
    employee_id: employeeId,
    work_date: workDate,
  }).populate('employee_id', 'first_name last_name employee_code');
  
  return attendance;
}

/**
 * Mark absences for employees who didn't check in
 */
export async function markAbsences(workDate: string): Promise<number> {
  await connectDB();
  
  // Get all active employees
  const employees = await Employee.find({
    employee_status: 'active',
    deleted_at: null,
  }).select('_id');
  
  let markedCount = 0;
  
  for (const employee of employees) {
    // Check if attendance record exists
    const existing = await Attendance.findOne({
      employee_id: employee._id,
      work_date: workDate,
    });
    
    if (!existing) {
      // Create absence record using new and save to trigger pre-save hook
      const absence = new Attendance({
        employee_id: employee._id,
        work_date: workDate,
        attendance_status: 'absent',
      });
      await absence.save();
      markedCount++;
    }
  }
  
  return markedCount;
}

/**
 * Generate attendance report
 */
export async function generateAttendanceReport(
  startDate: string,
  endDate: string,
  employeeId?: string
) {
  await connectDB();
  
  const filter: any = {
    work_date: { $gte: startDate, $lte: endDate },
  };
  
  if (employeeId) {
    filter.employee_id = employeeId;
  }
  
  const records = await Attendance.find(filter)
    .populate('employee_id', 'first_name last_name employee_code department_id')
    .lean();
  
  // Calculate statistics
  const totalRecords = records.length;
  const presentCount = records.filter(r => r.attendance_status === 'present').length;
  const lateCount = records.filter(r => r.attendance_status === 'late').length;
  const absentCount = records.filter(r => r.attendance_status === 'absent').length;
  const halfDayCount = records.filter(r => r.attendance_status === 'half_day').length;
  
  const totalWorkHours = records.reduce((sum, r) => sum + (r.work_hours || 0), 0);
  const avgWorkHours = totalRecords > 0 ? totalWorkHours / totalRecords : 0;
  
  return {
    records,
    statistics: {
      total_records: totalRecords,
      present_count: presentCount,
      late_count: lateCount,
      absent_count: absentCount,
      half_day_count: halfDayCount,
      total_work_hours: Math.round(totalWorkHours * 100) / 100,
      average_work_hours: Math.round(avgWorkHours * 100) / 100,
      attendance_rate: totalRecords > 0 
        ? Math.round(((presentCount + lateCount + halfDayCount) / totalRecords) * 100) 
        : 0,
    },
  };
}
