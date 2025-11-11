import { z } from 'zod';

export const createDepartmentSchema = z.object({
  department_code: z.string().min(1, 'Department code is required'),
  department_name: z.string().min(1, 'Department name is required'),
  department_name_khmer: z.string().optional(),
  manager_id: z.string().optional(),
  parent_department_id: z.string().optional(),
});

export const updateDepartmentSchema = z.object({
  department_code: z.string().min(1).optional(),
  department_name: z.string().min(1).optional(),
  department_name_khmer: z.string().optional(),
  manager_id: z.string().optional().nullable(),
  parent_department_id: z.string().optional().nullable(),
  department_status: z.enum(['active', 'inactive']).optional(),
});

export const departmentQuerySchema = z.object({
  department_status: z.enum(['active', 'inactive']).optional(),
  parent_department_id: z.string().optional(),
});

export type CreateDepartmentSchema = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentSchema = z.infer<typeof updateDepartmentSchema>;
export type DepartmentQuerySchema = z.infer<typeof departmentQuerySchema>;
