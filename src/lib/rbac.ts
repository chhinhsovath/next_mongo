import { UserRole } from '@/types';

/**
 * Role hierarchy (higher number = more permissions)
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  employee: 1,
  manager: 2,
  hr_manager: 3,
  admin: 4,
};

/**
 * Check if a user has a specific role
 */
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Check if a user has any of the specified roles
 */
export function hasAnyRole(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.some((role) => hasRole(userRole, role));
}

/**
 * Check if a user is an admin
 */
export function isAdmin(userRole: UserRole): boolean {
  return userRole === 'admin';
}

/**
 * Check if a user is an HR manager or admin
 */
export function isHRManagerOrAdmin(userRole: UserRole): boolean {
  return hasRole(userRole, 'hr_manager');
}

/**
 * Check if a user is a manager or above
 */
export function isManagerOrAbove(userRole: UserRole): boolean {
  return hasRole(userRole, 'manager');
}

/**
 * Check if a user can manage employees
 */
export function canManageEmployees(userRole: UserRole): boolean {
  return hasRole(userRole, 'hr_manager');
}

/**
 * Check if a user can approve leave requests
 */
export function canApproveLeave(userRole: UserRole): boolean {
  return hasRole(userRole, 'manager');
}

/**
 * Check if a user can manage payroll
 */
export function canManagePayroll(userRole: UserRole): boolean {
  return hasRole(userRole, 'hr_manager');
}

/**
 * Check if a user can view reports
 */
export function canViewReports(userRole: UserRole): boolean {
  return hasRole(userRole, 'manager');
}

/**
 * Check if a user can manage organizational structure
 */
export function canManageOrganization(userRole: UserRole): boolean {
  return hasRole(userRole, 'hr_manager');
}

/**
 * Check if a user can conduct performance evaluations
 */
export function canEvaluatePerformance(userRole: UserRole): boolean {
  return hasRole(userRole, 'manager');
}

/**
 * Permission definitions for different features
 */
export const PERMISSIONS = {
  // Employee management
  VIEW_EMPLOYEES: ['employee', 'manager', 'hr_manager', 'admin'] as UserRole[],
  MANAGE_EMPLOYEES: ['hr_manager', 'admin'] as UserRole[],
  CREATE_EMPLOYEE: ['hr_manager', 'admin'] as UserRole[],
  UPDATE_EMPLOYEE: ['hr_manager', 'admin'] as UserRole[],
  DELETE_EMPLOYEE: ['hr_manager', 'admin'] as UserRole[],

  // Leave management
  VIEW_OWN_LEAVE: ['employee', 'manager', 'hr_manager', 'admin'] as UserRole[],
  CREATE_LEAVE_REQUEST: ['employee', 'manager', 'hr_manager', 'admin'] as UserRole[],
  APPROVE_LEAVE: ['manager', 'hr_manager', 'admin'] as UserRole[],
  VIEW_ALL_LEAVE: ['manager', 'hr_manager', 'admin'] as UserRole[],

  // Attendance
  VIEW_OWN_ATTENDANCE: ['employee', 'manager', 'hr_manager', 'admin'] as UserRole[],
  RECORD_ATTENDANCE: ['employee', 'manager', 'hr_manager', 'admin'] as UserRole[],
  VIEW_ALL_ATTENDANCE: ['manager', 'hr_manager', 'admin'] as UserRole[],
  MANAGE_ATTENDANCE: ['hr_manager', 'admin'] as UserRole[],

  // Payroll
  VIEW_OWN_PAYROLL: ['employee', 'manager', 'hr_manager', 'admin'] as UserRole[],
  VIEW_ALL_PAYROLL: ['hr_manager', 'admin'] as UserRole[],
  MANAGE_PAYROLL: ['hr_manager', 'admin'] as UserRole[],

  // Performance
  VIEW_OWN_PERFORMANCE: ['employee', 'manager', 'hr_manager', 'admin'] as UserRole[],
  CONDUCT_EVALUATION: ['manager', 'hr_manager', 'admin'] as UserRole[],
  VIEW_ALL_EVALUATIONS: ['hr_manager', 'admin'] as UserRole[],

  // Organization
  VIEW_ORGANIZATION: ['employee', 'manager', 'hr_manager', 'admin'] as UserRole[],
  MANAGE_DEPARTMENTS: ['hr_manager', 'admin'] as UserRole[],
  MANAGE_POSITIONS: ['hr_manager', 'admin'] as UserRole[],

  // Reports
  VIEW_REPORTS: ['manager', 'hr_manager', 'admin'] as UserRole[],
  EXPORT_REPORTS: ['manager', 'hr_manager', 'admin'] as UserRole[],
};

/**
 * Check if a user has a specific permission
 */
export function hasPermission(
  userRole: UserRole,
  permission: keyof typeof PERMISSIONS
): boolean {
  return PERMISSIONS[permission].includes(userRole);
}
