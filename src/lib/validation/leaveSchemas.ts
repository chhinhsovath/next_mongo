import { z } from 'zod';

export const createLeaveRequestSchema = z.object({
  employee_id: z.string().min(1, 'Employee ID is required'),
  leave_type_id: z.string().min(1, 'Leave type is required'),
  start_date: z.string().or(z.date()).transform((val) => new Date(val)),
  end_date: z.string().or(z.date()).transform((val) => new Date(val)),
  reason: z.string().min(1, 'Reason is required').max(500, 'Reason must be less than 500 characters'),
}).refine((data) => data.start_date <= data.end_date, {
  message: 'End date must be after or equal to start date',
  path: ['end_date'],
});

export const approveLeaveSchema = z.object({
  approved_by: z.string().min(1, 'Approver ID is required'),
});

export const rejectLeaveSchema = z.object({
  rejection_reason: z.string().min(1, 'Rejection reason is required').max(500, 'Rejection reason must be less than 500 characters'),
});

export const leaveRequestQuerySchema = z.object({
  employee_id: z.string().optional(),
  leave_status: z.enum(['pending', 'approved', 'rejected', 'cancelled']).optional(),
  start_date: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  end_date: z.string().optional().transform((val) => val ? new Date(val) : undefined),
});
