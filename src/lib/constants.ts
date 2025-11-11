// Application constants

// Timezone
export const CAMBODIA_TIMEZONE = 'Asia/Phnom_Penh';

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Date formats
export const DATE_FORMAT = 'YYYY-MM-DD';
export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
export const TIME_FORMAT = 'HH:mm:ss';
export const MONTH_FORMAT = 'YYYY-MM';

// Session
export const SESSION_TIMEOUT = 30 * 60; // 30 minutes in seconds

// Employee codes
export const EMPLOYEE_CODE_PREFIX = 'EMP';

// ID prefixes
export const ID_PREFIXES = {
  USER: 'USR',
  EMPLOYEE: 'EMP',
  LEAVE_REQUEST: 'LR',
  LEAVE_TYPE: 'LT',
  ATTENDANCE: 'ATT',
  PAYROLL: 'PAY',
  EVALUATION: 'EVAL',
  DEPARTMENT: 'DEPT',
  POSITION: 'POS',
};

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  HR_MANAGER: 'hr_manager',
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
} as const;

// Status values
export const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  DRAFT: 'draft',
  COMPLETED: 'completed',
  PAID: 'paid',
} as const;

// Attendance status
export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  LATE: 'late',
  ABSENT: 'absent',
  HALF_DAY: 'half_day',
} as const;

// Employee types
export const EMPLOYEE_TYPES = {
  FULL_TIME: 'full_time',
  PART_TIME: 'part_time',
  CONTRACT: 'contract',
  INTERN: 'intern',
} as const;

// Gender options
export const GENDER_OPTIONS = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other',
} as const;

// API error codes
export const ERROR_CODES = {
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  CONFLICT: 'CONFLICT',
  SERVER_ERROR: 'SERVER_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
} as const;
