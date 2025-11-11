import { z } from 'zod';

export const createPayrollSchema = z.object({
  employee_id: z.string().min(1, 'Employee ID is required'),
  payroll_month: z.string().regex(/^\d{4}-\d{2}$/, 'Payroll month must be in YYYY-MM format'),
  base_salary: z.number().nonnegative('Base salary must be non-negative'),
  allowances: z.number().nonnegative('Allowances must be non-negative').default(0),
  bonuses: z.number().nonnegative('Bonuses must be non-negative').default(0),
  deductions: z.number().nonnegative('Deductions must be non-negative').default(0),
  overtime_pay: z.number().nonnegative('Overtime pay must be non-negative').default(0),
});

export const updatePayrollSchema = z.object({
  base_salary: z.number().nonnegative().optional(),
  allowances: z.number().nonnegative().optional(),
  bonuses: z.number().nonnegative().optional(),
  deductions: z.number().nonnegative().optional(),
  overtime_pay: z.number().nonnegative().optional(),
  payment_date: z.string().or(z.date()).transform((val) => new Date(val)).optional(),
  payroll_status: z.enum(['draft', 'approved', 'paid']).optional(),
});

export const approvePayrollSchema = z.object({
  approved_by: z.string().min(1, 'Approver ID is required'),
});

export const generatePayrollSchema = z.object({
  payroll_month: z.string().regex(/^\d{4}-\d{2}$/, 'Payroll month must be in YYYY-MM format'),
  employee_ids: z.array(z.string()).optional(),
});

export const payrollQuerySchema = z.object({
  employee_id: z.string().optional(),
  payroll_month: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  payroll_status: z.enum(['draft', 'approved', 'paid']).optional(),
});

export type CreatePayrollSchema = z.infer<typeof createPayrollSchema>;
export type UpdatePayrollSchema = z.infer<typeof updatePayrollSchema>;
export type ApprovePayrollSchema = z.infer<typeof approvePayrollSchema>;
export type GeneratePayrollSchema = z.infer<typeof generatePayrollSchema>;
export type PayrollQuerySchema = z.infer<typeof payrollQuerySchema>;
