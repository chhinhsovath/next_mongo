import { z } from 'zod';

export const createEmployeeSchema = z.object({
  employee_code: z.string().min(1, 'Employee code is required'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  first_name_khmer: z.string().optional(),
  last_name_khmer: z.string().optional(),
  email: z.string().email('Invalid email address'),
  phone_number: z.string().min(1, 'Phone number is required'),
  date_of_birth: z.coerce.date(),
  gender: z.enum(['male', 'female', 'other']),
  national_id: z.string().min(1, 'National ID is required'),
  address: z.string().min(1, 'Address is required'),
  department_id: z.string().min(1, 'Department is required'),
  position_id: z.string().min(1, 'Position is required'),
  employee_type: z.enum(['full_time', 'part_time', 'contract', 'intern']),
  hire_date: z.coerce.date(),
  salary_amount: z.coerce.number().positive('Salary must be positive'),
});

export const updateEmployeeSchema = z.object({
  employee_code: z.string().min(1).optional(),
  first_name: z.string().min(1).optional(),
  last_name: z.string().min(1).optional(),
  first_name_khmer: z.string().optional(),
  last_name_khmer: z.string().optional(),
  email: z.string().email().optional(),
  phone_number: z.string().min(1).optional(),
  date_of_birth: z.coerce.date().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  national_id: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  department_id: z.string().min(1).optional(),
  position_id: z.string().min(1).optional(),
  employee_type: z.enum(['full_time', 'part_time', 'contract', 'intern']).optional(),
  employee_status: z.enum(['active', 'inactive', 'terminated']).optional(),
  hire_date: z.coerce.date().optional(),
  termination_date: z.coerce.date().optional(),
  salary_amount: z.coerce.number().positive().optional(),
  profile_photo_url: z.string().url().optional(),
});

export type CreateEmployeeSchema = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeSchema = z.infer<typeof updateEmployeeSchema>;
