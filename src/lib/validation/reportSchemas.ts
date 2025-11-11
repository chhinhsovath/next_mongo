import { z } from 'zod';

/**
 * Validation schemas for report generation
 */

export const headcountReportSchema = z.object({
  department_id: z.string().optional(),
  position_id: z.string().optional(),
  employee_status: z.enum(['active', 'inactive', 'terminated']).optional(),
  as_of_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const leaveUtilizationReportSchema = z.object({
  employee_id: z.string().optional(),
  department_id: z.string().optional(),
  leave_type_id: z.string().optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format'),
}).refine((data) => new Date(data.start_date) <= new Date(data.end_date), {
  message: 'End date must be after or equal to start date',
  path: ['end_date'],
});

export const attendanceSummaryReportSchema = z.object({
  employee_id: z.string().optional(),
  department_id: z.string().optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format'),
}).refine((data) => new Date(data.start_date) <= new Date(data.end_date), {
  message: 'End date must be after or equal to start date',
  path: ['end_date'],
});

export const payrollSummaryReportSchema = z.object({
  department_id: z.string().optional(),
  payroll_month: z.string().regex(/^\d{4}-\d{2}$/, 'Payroll month must be in YYYY-MM format'),
  payroll_status: z.enum(['draft', 'approved', 'paid']).optional(),
});

export type HeadcountReportSchema = z.infer<typeof headcountReportSchema>;
export type LeaveUtilizationReportSchema = z.infer<typeof leaveUtilizationReportSchema>;
export type AttendanceSummaryReportSchema = z.infer<typeof attendanceSummaryReportSchema>;
export type PayrollSummaryReportSchema = z.infer<typeof payrollSummaryReportSchema>;
