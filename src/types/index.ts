// Common types
export type UserRole = 'admin' | 'hr_manager' | 'manager' | 'employee';
export type UserStatus = 'active' | 'inactive';
export type EmployeeType = 'full_time' | 'part_time' | 'contract' | 'intern';
export type EmployeeStatus = 'active' | 'inactive' | 'terminated';
export type Gender = 'male' | 'female' | 'other';
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type AttendanceStatus = 'present' | 'late' | 'absent' | 'half_day';
export type PayrollStatus = 'draft' | 'approved' | 'paid';
export type EvaluationStatus = 'draft' | 'completed' | 'acknowledged';
export type DepartmentStatus = 'active' | 'inactive';
export type PositionStatus = 'active' | 'inactive';
export type LeaveTypeStatus = 'active' | 'inactive';

// Re-export module types
export * from './employee';
export * from './leave';
export * from './attendance';
export * from './payroll';
export * from './performance';

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: any;
  code?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
