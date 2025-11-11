import { z } from 'zod';

export const createUserSchema = z.object({
  employee_id: z.string().min(1, 'Employee ID is required'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username must be less than 50 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100, 'Password must be less than 100 characters'),
  user_role: z.enum(['admin', 'hr_manager', 'manager', 'employee']),
});

export const updateUserSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  password: z.string().min(8).max(100).optional(),
  user_role: z.enum(['admin', 'hr_manager', 'manager', 'employee']).optional(),
  user_status: z.enum(['active', 'inactive']).optional(),
});

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export type CreateUserSchema = z.infer<typeof createUserSchema>;
export type UpdateUserSchema = z.infer<typeof updateUserSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;
