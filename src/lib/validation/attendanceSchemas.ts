import { z } from 'zod';

export const checkInSchema = z.object({
  employee_id: z.string().min(1, 'Employee ID is required'),
  work_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Work date must be in YYYY-MM-DD format'),
  check_in_time: z.string().or(z.date()).transform((val) => new Date(val)),
  check_in_location_lat: z.number().min(-90).max(90).optional(),
  check_in_location_lng: z.number().min(-180).max(180).optional(),
});

export const checkOutSchema = z.object({
  employee_id: z.string().min(1, 'Employee ID is required'),
  work_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Work date must be in YYYY-MM-DD format'),
  check_out_time: z.string().or(z.date()).transform((val) => new Date(val)),
  check_out_location_lat: z.number().min(-90).max(90).optional(),
  check_out_location_lng: z.number().min(-180).max(180).optional(),
});

export const attendanceQuerySchema = z.object({
  employee_id: z.string().optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  attendance_status: z.enum(['present', 'late', 'absent', 'half_day']).optional(),
});

export const markAbsencesSchema = z.object({
  work_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Work date must be in YYYY-MM-DD format'),
});

export type CheckInSchema = z.infer<typeof checkInSchema>;
export type CheckOutSchema = z.infer<typeof checkOutSchema>;
export type AttendanceQuerySchema = z.infer<typeof attendanceQuerySchema>;
export type MarkAbsencesSchema = z.infer<typeof markAbsencesSchema>;
